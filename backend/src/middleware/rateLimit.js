const rateLimit = require('express-rate-limit');

// Login had no rate limiting at all — an attacker could brute-force the
// admin password with unlimited attempts. 10 attempts per 15 minutes per IP
// is generous enough for a real user who mistypes a password a few times,
// but cuts off automated brute-forcing.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
});

// The copilot endpoint makes a live, paid LLM call per request with no
// limit — an easy way to burn through the Groq quota (or run up a bill on
// a paid tier) by hitting it in a loop. 20 questions per 10 minutes per IP
// is generous for a real operator using the chat widget.
const copilotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many copilot requests. Please slow down and try again shortly.' },
});

module.exports = { loginLimiter, copilotLimiter };
