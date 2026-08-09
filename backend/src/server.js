require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const BloodBank = require("./models/BloodBank");
const { seedDatabase } = require("./config/seed");

const PORT = process.env.PORT || 5000;

async function ensureDemoData() {
  // Auto-seed whenever the database is empty — covers the fresh in-memory
  // database on every restart, and saves judges/reviewers from ever having
  // to remember a manual `npm run seed` step before a demo.
  const existingBloodBanks = await BloodBank.countDocuments();
  if (existingBloodBanks > 0) {
    console.log("📦 Existing data found — skipping auto-seed.");
    return;
  }

  console.log("🌱 Database is empty — auto-seeding demo data...");
  await seedDatabase();
}

connectDB()
  .then(ensureDemoData)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Fatal startup error:", error);
    process.exit(1);
  });
