const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// CORS was previously wide open (cors() with no options accepts every
// origin), so any website could call this API using a stolen/leaked token.
// ALLOWED_ORIGINS is a comma-separated list in .env; defaults to the two
// ports this project's own frontend actually runs on (Vite dev default is
// 8080 per vite.config.ts, 3000 is the port referenced in the README) so
// local dev keeps working without extra setup.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header, e.g. curl/Postman/health checks).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/bloodbanks", require("./routes/bloodBankRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/transfers", require("./routes/transferRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/forecast", require("./routes/forecastRoutes"));
app.use("/api/copilot", require("./routes/copilotRoutes"));

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PulseLink Backend Running 🚀"
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend Healthy"
  });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;