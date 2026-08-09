// Centralized JWT secret access.
//
// Previously, both middleware/auth.js and controllers/authController.js each
// hardcoded `'pulselink_secret_key'` as a silent fallback whenever
// JWT_SECRET was missing from the environment. That meant a misconfigured
// deployment (env var simply not set) would keep running — with a secret
// value visible to anyone who reads this public repo, letting them forge
// valid tokens for any user, including admins.
//
// This module fails fast instead: in production it throws at startup if
// JWT_SECRET isn't set, so the problem is caught before the server ever
// accepts traffic. In development it still falls back (with a loud warning)
// so `npm run dev` keeps working out of the box for a hackathon demo without
// requiring every contributor to hand-configure a secret first.

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start in production without an explicit, secret JWT signing key.'
    );
  }

  console.warn(
    '⚠️  JWT_SECRET is not set — using an insecure development-only fallback. ' +
      'Set JWT_SECRET in backend/.env before deploying anywhere real.'
  );
  return 'dev-only-insecure-fallback-secret-do-not-use-in-production';
}

module.exports = { getJwtSecret };
