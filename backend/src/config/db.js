const mongoose = require('mongoose');
const path = require('path');

// ---------------------------------------------------------------------------
// Zero-setup database connection — built for hackathon-demo reliability.
//
// Priority order:
//   1. If MONGODB_URI is explicitly set AND it is not the plain default
//      localhost URI, treat it as an intentional real database (e.g. Atlas)
//      and connect to it directly.
//   2. Otherwise, boot a real MongoDB binary in-memory (mongodb-memory-server)
//      right inside this process. No Docker, no local `mongod`, no manual
//      install required — `npm run dev` / `npm start` just works.
//   3. If step 1 fails for any reason (bad creds, no network, DB down), we
//      automatically fall back to the in-memory database instead of crashing
//      the whole demo.
//
// The in-memory database is real MongoDB (downloaded once and cached by
// mongodb-memory-server), so every Mongoose query/aggregation in this
// codebase runs unmodified — this is purely a connection-layer swap.
// ---------------------------------------------------------------------------

const DEFAULT_LOCAL_URI = 'mongodb://localhost:27017/pulselink';

let memoryServer; // keep a reference so we can shut it down cleanly if needed

// Pinned to a long-established release (rather than "latest") because
// brand-new MongoDB versions often lag on prebuilt binaries for newer OS
// releases (e.g. Ubuntu 24.04), which makes the automatic download 403.
// 7.0.x has broad, well-tested platform coverage. Override with
// MONGODB_MEMORY_SERVER_VERSION if your platform needs a different build.
const MEMORY_SERVER_MONGO_VERSION = process.env.MONGODB_MEMORY_SERVER_VERSION || '7.0.14';

// Fixed on-disk location for the memory-server's data files. Passing a
// concrete dbPath (instead of leaving it unset) is what makes this
// "persistent" — without it, mongodb-memory-server allocates a brand new
// temp directory every single time it boots, which is why the database used
// to reset on every nodemon restart even though the underlying engine is a
// real, durable MongoDB (WiredTiger) writing real data files to disk.
const MEMORY_SERVER_DB_PATH =
  process.env.MONGODB_MEMORY_DBPATH || path.join(__dirname, '..', '..', '.mongo-data');

async function startInMemoryMongo() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const fs = require('fs');
  const isFirstRun = !fs.existsSync(MEMORY_SERVER_DB_PATH);

  // mongodb-memory-server scans this directory on startup rather than
  // creating it itself — without this, a fresh (first-run) dbPath throws
  // ENOENT before Mongo ever gets a chance to initialize it.
  if (isFirstRun) {
    fs.mkdirSync(MEMORY_SERVER_DB_PATH, { recursive: true });
  }

  console.log(`🧠 No external MongoDB configured — starting a local persistent MongoDB for this run...`);
  console.log(`   Data directory: ${MEMORY_SERVER_DB_PATH}`);
  console.log('   (First run downloads a small MongoDB binary and caches it — after that it works offline.)');

  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'pulselink',
      dbPath: MEMORY_SERVER_DB_PATH,
      storageEngine: 'wiredTiger',
    },
    binary: { version: MEMORY_SERVER_MONGO_VERSION },
  });
  const uri = memoryServer.getUri('pulselink');
  await mongoose.connect(uri);

  if (isFirstRun) {
    console.log('✅ Local MongoDB ready — first run, data directory just created.');
  } else {
    console.log('✅ Local MongoDB ready — reattached to existing data directory.');
    console.log('   Your data from the last run is intact.');
  }
}

async function connectDB() {
  const configuredUri = process.env.MONGODB_URI;
  const wantsExplicitDatabase = configuredUri && configuredUri !== DEFAULT_LOCAL_URI;

  if (wantsExplicitDatabase) {
    try {
      const conn = await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`⚠️  Could not connect to configured MONGODB_URI (${error.message}).`);
      console.error('   Falling back to local MongoDB if available, otherwise in-memory.');
    }
  }

  try {
    const conn = await mongoose.connect(DEFAULT_LOCAL_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.error(`⚠️  Could not connect to local MongoDB at ${DEFAULT_LOCAL_URI} (${error.message}).`);
    console.error('   Falling back to an in-memory MongoDB so the app still runs.');
  }

  await startInMemoryMongo();
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
