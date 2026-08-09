# PulseLink Backend

Intelligent Blood Redistribution Platform - Backend API

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs
- dotenv
- cors
- cookie-parser
- morgan

## Setup

> If you're running the whole project (frontend + backend together), see the
> root-level `README.md` for the one-command `npm run setup && npm run dev`
> flow — that's the easiest path. The steps below are for running this
> backend on its own.

1. Install dependencies:
```bash
npm install
```

2. Environment variables (`.env` is already included with sane defaults —
   edit it only if you want to point at a different port or a real database):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulselink
JWT_SECRET=pulselink_secret_key_change_this_in_production
NODE_ENV=development
```

   **No MongoDB install required.** If `MONGODB_URI` is left at its default
   value, the server automatically starts a zero-setup, in-memory MongoDB
   (via `mongodb-memory-server`) instead of trying to reach a real one. To
   use a real/persistent database instead (e.g. MongoDB Atlas), just change
   `MONGODB_URI` to your real connection string.

3. Start the server:
```bash
npm run dev
```
Or production:
```bash
npm start
```

**Demo data seeds itself automatically** the first time the server starts
against an empty database — no manual step needed. It creates:
- 1 Admin user (admin@pulselink.com / admin123)
- 5 Blood Banks
- 5 Hospitals
- ~90 Inventory records (weighted so plenty are genuinely expiring soon)
- AI-generated recommendations from that real inventory
- A handful of pre-approved transfers, so activity/analytics aren't empty

To force a fresh reseed at any time (e.g. against a real/persistent database):
```bash
npm run seed
```

## API Endpoints

> **Note on auth:** the frontend doesn't currently implement a login flow, so
> the endpoints it depends on (dashboard, blood banks, inventory,
> recommendations, transfers, analytics) are open — this keeps the demo
> frictionless. `POST /api/auth/login` and the `auth`/`adminAuth` middleware
> are implemented and working (see `src/middleware/auth.js`) and are applied
> to the Hospitals routes below; wire them into more routes if you add a
> login screen.

### Authentication
- `POST /api/auth/login` - Login and receive JWT token

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (stats, recent activity, alerts, top pending recommendations)

### Blood Banks
- `GET /api/bloodbanks` - Get all blood banks
- `GET /api/bloodbanks/:id` - Get single blood bank
- `POST /api/bloodbanks` - Create blood bank
- `PUT /api/bloodbanks/:id` - Update blood bank
- `DELETE /api/bloodbanks/:id` - Delete blood bank

### Hospitals
- `GET /api/hospitals` - Get all hospitals (requires auth)
- `GET /api/hospitals/:id` - Get single hospital (requires auth)
- `POST /api/hospitals` - Create hospital (admin only)
- `PUT /api/hospitals/:id` - Update hospital (admin only)
- `DELETE /api/hospitals/:id` - Delete hospital (admin only)

### Inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:id` - Get single inventory item
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Recommendations
- `GET /api/recommendations` - Get all recommendations
- `GET /api/recommendations/:id` - Get single recommendation
- `POST /api/recommendations` - Create recommendation (admin only)
- `POST /api/recommendations/generate` - Generate AI recommendations from current inventory
- `POST /api/recommendations/:id/approve` - Approve recommendation and create transfer
- `POST /api/recommendations/:id/reject` - Reject/dismiss a recommendation

### Transfers
- `GET /api/transfers` - Get all transfers
- `GET /api/transfers/:id` - Get single transfer

### Analytics
- `GET /api/analytics` - Get analytics data for charts

## Recommendation Engine

The recommendation engine uses a rule-based approach:

1. Finds inventory expiring within 48 hours
2. Identifies nearby hospitals (within 100km)
3. Calculates Haversine distance between blood bank and hospital
4. Determines confidence score based on:
   - Distance to destination
   - Hours until expiry
5. Assigns priority (critical, high, medium, low)
6. Generates transfer time estimate
7. Creates AI-generated natural language explanation
8. Generates redistribution recommendations from Blood Bank to Hospital

## Database Models

### User
- name, email, password, role

### BloodBank
- name, city, address, latitude, longitude, contact, status

### Hospital
- name, city, address, latitude, longitude, contact, status

### Inventory
- bloodBank, bloodGroup, component, units, expiryDate, status

### Recommendation
- sourceBloodBank, destinationBloodBank, bloodGroup, deficitBloodGroup, matchType, component, units, distance, priority, confidence, expiryScore, deficitScore, distanceScore, estimatedTransferTime, expiryHoursRemaining, aiReason, status

### Transfer
- recommendationId, sourceBloodBank, destinationBloodBank, bloodGroup, component, units, status, estimatedArrivalTime, approvedBy, approvedAt
