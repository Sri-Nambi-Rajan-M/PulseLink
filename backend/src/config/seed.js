require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const Inventory = require('../models/Inventory');
const Recommendation = require('../models/Recommendation');
const Transfer = require('../models/Transfer');
const UsageHistory = require('../models/UsageHistory');
const connectDB = require('./db');
const { generateRecommendations } = require('../services/recommendationService');

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const components = ['Whole Blood', 'Red Blood Cells', 'Platelets', 'Plasma'];

// ---------------------------------------------------------------------------
// Historical transfer backfill.
//
// The live pre-approval block above only ever creates records dated "now",
// so every seeded transfer landed on a single day. Anything that charts
// transfers over time (analyticsController groups Transfer by day, and any
// future demand-forecasting feature needs a real time series to learn from)
// showed either one big spike or a flat line — not a trend. This backfills
// a spread of backdated, internally-consistent Transfer + Recommendation
// pairs across the past ~90 days with a realistic mix of outcomes, without
// touching current live inventory (they're historical, so they don't
// decrement anything that's still "available" today).
// ---------------------------------------------------------------------------
const HISTORICAL_DAYS = 90;
const HISTORICAL_TRANSFERS_TARGET = 60;
const TRANSFER_STATUS_WEIGHTS = [
  { status: 'completed', weight: 0.7 },
  { status: 'in_transit', weight: 0.15 },
  { status: 'cancelled', weight: 0.15 },
];

function pickWeighted(buckets) {
  const r = Math.random();
  let acc = 0;
  for (const b of buckets) {
    acc += b.weight;
    if (r <= acc) return b;
  }
  return buckets[buckets.length - 1];
}

async function seedHistoricalTransfers(bloodBanks, admin) {
  const docs = [];
  for (let i = 0; i < HISTORICAL_TRANSFERS_TARGET; i++) {
    const daysAgo = Math.floor(Math.random() * HISTORICAL_DAYS) + 1; // 1..90 days back, never "today"
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    let source = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
    let destination = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
    if (source._id.equals(destination._id)) {
      destination = bloodBanks[(bloodBanks.indexOf(source) + 1) % bloodBanks.length];
    }

    const bloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
    const component = components[Math.floor(Math.random() * components.length)];
    const units = Math.floor(Math.random() * 8) + 2;
    const distance = Math.round(5 + Math.random() * 60);
    const estimatedTransferTime = Math.round(30 + distance * 1.5); // minutes, roughly distance-scaled
    const expiryHoursRemaining = Math.round(4 + Math.random() * 44);
    const expiryScore = Math.round(100 - (expiryHoursRemaining / 48) * 100);
    const deficitScore = Math.round(40 + Math.random() * 60);
    const distanceScore = Math.round(Math.max(0, 100 - distance));
    const confidence = Math.round((expiryScore + deficitScore + distanceScore) / 3);
    const priority = confidence >= 80 ? 'critical' : confidence >= 60 ? 'high' : confidence >= 40 ? 'medium' : 'low';

    const recommendation = await Recommendation.create([{
      sourceBloodBank: source._id,
      destinationBloodBank: destination._id,
      bloodGroup,
      deficitBloodGroup: bloodGroup,
      matchType: 'exact',
      component,
      units,
      distance,
      priority,
      confidence,
      expiryScore,
      deficitScore,
      distanceScore,
      estimatedTransferTime,
      expiryHoursRemaining,
      aiReason: `Historical match: ${component} (${bloodGroup}) surplus at source redirected to a deficit destination.`,
      status: 'approved',
      createdAt,
      updatedAt: createdAt,
    }], { timestamps: false });

    const { status } = pickWeighted(TRANSFER_STATUS_WEIGHTS);
    const estimatedArrivalTime = new Date(createdAt.getTime() + estimatedTransferTime * 60 * 1000);

    docs.push({
      recommendationId: recommendation[0]._id,
      sourceBloodBank: source._id,
      destinationBloodBank: destination._id,
      bloodGroup,
      component,
      units,
      status,
      estimatedArrivalTime,
      approvedBy: admin._id,
      approvedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    });
  }

  await Transfer.insertMany(docs, { timestamps: false });
  return docs.length;
}

// ---------------------------------------------------------------------------
// Daily consumption history backfill — this is what the forecasting engine
// (services/forecastService.js) actually learns from. Each bank gets its own
// "personality" (base demand size, growth/decline trend, weekend spike
// behavior) so the resulting forecasts genuinely differ bank-to-bank instead
// of all converging on the same flat line.
// ---------------------------------------------------------------------------
const USAGE_HISTORY_DAYS = 60;

// Deterministic-ish per-bank profile so re-running seed produces a believable
// but not identical spread. O+/O- (universal groups) run hotter everywhere,
// matching real transfusion demand patterns.
const HIGH_DEMAND_GROUPS = new Set(['O+', 'O-', 'A+']);

function gaussianNoise(mean, stdDevAmount) {
  // Box-Muller transform for a roughly-normal random value.
  const u1 = Math.random() || 1e-6;
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDevAmount;
}

async function seedUsageHistory(bloodBanks) {
  const docs = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const bank of bloodBanks) {
    // Bank "size" factor: bigger city banks (Coimbatore, Chennai, Trichy,
    // Madurai) run consistently higher volumes than smaller district banks.
    const bigCityBanks = ['Coimbatore Government Blood Bank', 'Chennai Government Blood Bank', 'Trichy Government Blood Bank', 'Madurai Government Blood Bank'];
    const sizeFactor = bigCityBanks.includes(bank.name) ? 1.6 : 1.0;

    for (const bloodGroup of bloodGroups) {
      const demandFactor = HIGH_DEMAND_GROUPS.has(bloodGroup) ? 1.5 : 1.0;
      const baseDaily = 1.2 * sizeFactor * demandFactor;

      // Random per-series trend: slightly rising, slightly falling, or flat —
      // simulates real demand drift (e.g. a bank near a growing hospital
      // network trending up) without every series behaving identically.
      const trendPerDay = (Math.random() - 0.45) * 0.03; // skewed slightly positive

      for (let dayOffset = USAGE_HISTORY_DAYS; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dayIndex = USAGE_HISTORY_DAYS - dayOffset;

        const dow = date.getDay(); // 0 = Sunday, 6 = Saturday
        // Weekend/Friday bump — matches real trauma-driven weekend demand.
        const weekendFactor = (dow === 5 || dow === 6) ? 1.35 : dow === 0 ? 1.2 : 1.0;

        const trendComponent = trendPerDay * dayIndex;
        let expected = baseDaily * weekendFactor + trendComponent;

        // Occasional spike day (mass-casualty / emergency surge simulation),
        // more likely for high-demand groups.
        const spikeChance = HIGH_DEMAND_GROUPS.has(bloodGroup) ? 0.06 : 0.03;
        if (Math.random() < spikeChance) {
          expected += 3 + Math.random() * 4;
        }

        const unitsConsumed = Math.max(0, Math.round(gaussianNoise(expected, Math.max(0.4, expected * 0.25))));

        docs.push({
          bloodBank: bank._id,
          bloodGroup,
          date,
          unitsConsumed,
        });
      }
    }
  }

  await UsageHistory.insertMany(docs, { ordered: false });
  return docs.length;
}

// Reusable seeding routine — used both by the `npm run seed` CLI command and
// automatically by server.js on boot whenever the database is empty (e.g. a
// fresh in-memory database), so the demo always has realistic data without a
// manual step.
const seedDatabase = async () => {
  console.log('Clearing existing data...');
    await User.deleteMany({});
    await BloodBank.deleteMany({});
    await Inventory.deleteMany({});
    await Recommendation.deleteMany({});
    await Transfer.deleteMany({});
    await UsageHistory.deleteMany({});

    console.log('Seeding Users...');
    // Pass the plain password here, not a pre-hashed one — User.js's own
    // pre('save') hook already hashes `password` automatically on create.
    // Hashing it here too (as this used to) double-hashes it, which makes
    // every login attempt with the real password fail with "Invalid
    // credentials" forever, no matter how many times you reseed — the
    // stored value ends up being bcrypt(bcrypt('admin123')), which never
    // matches bcrypt.compare('admin123', ...).
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@pulselink.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin created: admin@pulselink.com / admin123');

    console.log('Seeding Blood Banks (Tamil Nadu network)...');
    // A real Tamil Nadu geography, not a generic 5-borough placeholder set.
    // Deliberately mixes a tight Kongu-belt cluster (Coimbatore–Tiruppur–
    // Erode–Salem–Namakkal–Tiruchengode–Karur, all within ~20-90km of each
    // other) with two farther-out banks (Trichy/Madurai) and one isolated
    // one (Chennai, >300km from the cluster). The engine's 100km logistics
    // cutoff means the cluster produces plenty of genuine matches while
    // Chennai mostly won't — an intentional, realistic "not everything is
    // reachable" case rather than a network where every bank conveniently
    // matches every other one.
    const bloodBanks = await BloodBank.create([
      {
        name: 'Coimbatore Government Blood Bank',
        city: 'Coimbatore',
        address: 'Trichy Road, Coimbatore, Tamil Nadu 641018',
        latitude: 11.0168,
        longitude: 76.9558,
        contact: '+91-422-2345001',
        status: 'active'
      },
      {
        name: 'Tiruppur District Blood Bank',
        city: 'Tiruppur',
        address: 'Kumaran Road, Tiruppur, Tamil Nadu 641601',
        latitude: 11.1085,
        longitude: 77.3411,
        contact: '+91-421-2245002',
        status: 'active'
      },
      {
        name: 'Erode Government Blood Bank',
        city: 'Erode',
        address: 'Perundurai Road, Erode, Tamil Nadu 638011',
        latitude: 11.3410,
        longitude: 77.7172,
        contact: '+91-424-2255003',
        status: 'active'
      },
      {
        name: 'Salem Government Blood Bank',
        city: 'Salem',
        address: 'Fort Main Road, Salem, Tamil Nadu 636001',
        latitude: 11.6643,
        longitude: 78.1460,
        contact: '+91-427-2265004',
        status: 'active'
      },
      {
        name: 'Namakkal District Blood Bank',
        city: 'Namakkal',
        address: 'Trichy Road, Namakkal, Tamil Nadu 637001',
        latitude: 11.2189,
        longitude: 78.1677,
        contact: '+91-4286-227005',
        status: 'active'
      },
      {
        name: 'Tiruchengode Blood Bank',
        city: 'Tiruchengode',
        address: 'Sankagiri Road, Tiruchengode, Tamil Nadu 637211',
        latitude: 11.3820,
        longitude: 77.8949,
        contact: '+91-4288-256006',
        status: 'active'
      },
      {
        name: 'Karur Government Blood Bank',
        city: 'Karur',
        address: 'Kovai Road, Karur, Tamil Nadu 639002',
        latitude: 10.9601,
        longitude: 78.0766,
        contact: '+91-4324-235007',
        status: 'active'
      },
      {
        name: 'Trichy Government Blood Bank',
        city: 'Tiruchirappalli',
        address: 'Puthur High Road, Tiruchirappalli, Tamil Nadu 620017',
        latitude: 10.7905,
        longitude: 78.7047,
        contact: '+91-431-2415008',
        status: 'active'
      },
      {
        name: 'Madurai Government Blood Bank',
        city: 'Madurai',
        address: 'Panagal Road, Madurai, Tamil Nadu 625020',
        latitude: 9.9252,
        longitude: 78.1198,
        contact: '+91-452-2525009',
        status: 'active'
      },
      {
        name: 'Chennai Government Blood Bank',
        city: 'Chennai',
        address: 'EVK Sampath Road, Chennai, Tamil Nadu 600003',
        latitude: 13.0827,
        longitude: 80.2707,
        contact: '+91-44-2535010',
        status: 'active'
      }
    ]);

    console.log('Seeding Inventory...');
    // Deliberately mix expiry windows so the recommendation engine (which only
    // looks at inventory expiring within 48 hours, and within 100km of another bank)
    // has plenty of real, matchable stock to work with — instead of leaving it to
    // chance with a fully random spread, which is why earlier demo runs only ever
    // produced 0-1 usable recommendation.
    const inventoryData = [];
    const expiryBuckets = [
      { weight: 0.45, minHours: 4, maxHours: 36 },   // urgent — feeds the AI engine directly
      { weight: 0.30, minHours: 36, maxHours: 120 }, // a few days out
      { weight: 0.25, minHours: 120, maxHours: 1440 } // healthy, longer-dated stock
    ];
    function pickExpiryHours() {
      const r = Math.random();
      let acc = 0;
      for (const b of expiryBuckets) {
        acc += b.weight;
        if (r <= acc) return b.minHours + Math.random() * (b.maxHours - b.minHours);
      }
      return expiryBuckets[expiryBuckets.length - 1].maxHours;
    }

    const urgentSamples = [
      { bankName: 'Coimbatore Government Blood Bank', bloodGroup: 'A+', component: 'Whole Blood', units: 6, expiryHours: 8 },
      { bankName: 'Tiruppur District Blood Bank', bloodGroup: 'B-', component: 'Red Blood Cells', units: 5, expiryHours: 10 },
      { bankName: 'Erode Government Blood Bank', bloodGroup: 'O-', component: 'Platelets', units: 4, expiryHours: 12 },
      { bankName: 'Salem Government Blood Bank', bloodGroup: 'AB+', component: 'Plasma', units: 7, expiryHours: 16 },
      { bankName: 'Namakkal District Blood Bank', bloodGroup: 'O+', component: 'Whole Blood', units: 8, expiryHours: 18 },
      { bankName: 'Tiruchengode Blood Bank', bloodGroup: 'A-', component: 'Plasma', units: 6, expiryHours: 14 },
      { bankName: 'Karur Government Blood Bank', bloodGroup: 'B+', component: 'Red Blood Cells', units: 5, expiryHours: 20 },
      { bankName: 'Trichy Government Blood Bank', bloodGroup: 'O+', component: 'Platelets', units: 4, expiryHours: 9 },
    ];

    for (const sample of urgentSamples) {
      const bloodBank = bloodBanks.find((bank) => bank.name === sample.bankName);
      if (!bloodBank) continue;
      inventoryData.push({
        bloodBank: bloodBank._id,
        bloodGroup: sample.bloodGroup,
        component: sample.component,
        units: sample.units,
        expiryDate: new Date(Date.now() + sample.expiryHours * 60 * 60 * 1000),
        status: 'available'
      });
    }

    for (let i = 0; i < 120; i++) {
      const bloodBank = bloodBanks[Math.floor(Math.random() * bloodBanks.length)];
      const bloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      const expiryDate = new Date(Date.now() + pickExpiryHours() * 60 * 60 * 1000);

      inventoryData.push({
        bloodBank: bloodBank._id,
        bloodGroup,
        component,
        units: Math.floor(Math.random() * 12) + 3,
        expiryDate,
        status: 'available'
      });
    }
    await Inventory.insertMany(inventoryData);

    console.log('Generating AI recommendations from real inventory...');
    // Use the actual recommendation engine (same logic the "Regenerate AI" button
    // calls) instead of inserting disconnected random rows. This guarantees every
    // seeded recommendation is genuinely approvable — no more "Insufficient
    // inventory at source" errors when clicking Approve during a demo.
    const generatedRecommendations = await generateRecommendations();
    console.log(`   Generated ${generatedRecommendations.length} real recommendations.`);

    console.log('Pre-approving a handful of recommendations for transfer history...');
    // Approve a few of the freshly generated recommendations the same way the
    // /approve endpoint does, so the dashboard, analytics, and transfer history
    // all show real, internally consistent activity the moment the app opens —
    // no need to click anything first for the demo to look alive.
    const pendingRecs = await Recommendation.find({ status: 'pending' }).sort({ confidence: -1 });
    const toPreApprove = pendingRecs.slice(0, Math.min(4, pendingRecs.length));
    let preApprovedCount = 0;

    for (const rec of toPreApprove) {
      const sourceInventory = await Inventory.findOneAndUpdate(
        {
          bloodBank: rec.sourceBloodBank,
          bloodGroup: rec.bloodGroup,
          component: rec.component,
          status: 'available',
          expiryDate: { $gte: new Date() },
          units: { $gte: rec.units }
        },
        { $inc: { units: -rec.units } },
        { new: true }
      );

      if (!sourceInventory) continue;

      if (sourceInventory.units === 0) {
        sourceInventory.status = 'transferred';
        await sourceInventory.save();
      }

      const estimatedArrivalTime = new Date(Date.now() + rec.estimatedTransferTime * 60 * 1000);
      await Transfer.create({
        recommendationId: rec._id,
        sourceBloodBank: rec.sourceBloodBank,
        destinationBloodBank: rec.destinationBloodBank,
        bloodGroup: rec.bloodGroup,
        component: rec.component,
        units: rec.units,
        status: 'completed',
        estimatedArrivalTime,
        approvedBy: admin._id
      });

      rec.status = 'approved';
      await rec.save();
      preApprovedCount += 1;
    }

    console.log('Backfilling historical transfer trend (past 90 days)...');
    const historicalCount = await seedHistoricalTransfers(bloodBanks, admin);

    console.log('Backfilling daily consumption history for shortage forecasting (past 60 days)...');
    const usageHistoryCount = await seedUsageHistory(bloodBanks);

    const finalPendingCount = await Recommendation.countDocuments({ status: 'pending' });
    const finalTransferCount = await Transfer.countDocuments();
    const finalInventoryCount = await Inventory.countDocuments();

    console.log('✅ Seed data completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - 1 Admin user (admin@pulselink.com / admin123)`);
    console.log(`   - ${bloodBanks.length} Blood banks (Tamil Nadu network)`);
    console.log(`   - ${finalInventoryCount} Inventory records`);
    console.log(`   - ${generatedRecommendations.length} AI recommendations generated (${finalPendingCount} still pending, ready to approve/dismiss)`);
    console.log(`   - ${preApprovedCount} pre-approved to seed transfer history`);
    console.log(`   - ${historicalCount} historical transfers backfilled across the past ${HISTORICAL_DAYS} days`);
    console.log(`   - ${usageHistoryCount} daily consumption records backfilled across the past ${USAGE_HISTORY_DAYS} days (forecast engine input)`);
    console.log(`   - ${finalTransferCount} Transfers total`);
};

module.exports = { seedDatabase };

// CLI entry point: `npm run seed` runs this file directly, in which case we
// own the DB connection and process lifetime. When imported by server.js for
// auto-seeding, none of this block runs — the caller manages the connection.
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      process.exit(1);
    }
  })();
}
