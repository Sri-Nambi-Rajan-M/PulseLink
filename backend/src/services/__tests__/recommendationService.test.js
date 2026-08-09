// Unit tests for recommendationService.js's pure scoring functions.
//
// The audit found this codebase had zero automated tests, despite the
// scoring math (recommendationService.js, forecastService.js) being pure
// functions that are trivially testable. These tests cover the functions
// most likely to silently break during future edits — the composite score
// is what every recommendation's priority and ranking depends on.
//
// Run with: node --test src/services/__tests__/*.test.js  (from backend/)
// Uses Node's built-in test runner (node:test) — no extra dependency needed.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getDeficitScore,
  getExpiryScore,
  getDistanceScore,
  calculateDistance,
  determinePriority,
  calculateTransferTime,
  COMPATIBILITY,
  WEIGHTS,
  PAR_LEVEL,
} = require('../recommendationService');

test('getDeficitScore: stock at or above par level means no deficit', () => {
  assert.equal(getDeficitScore(12, 'Whole Blood'), 0); // exactly at PAR_LEVEL
  assert.equal(getDeficitScore(20, 'Whole Blood'), 0); // above PAR_LEVEL
});

test('getDeficitScore: zero stock is maximally urgent', () => {
  assert.equal(getDeficitScore(0, 'Whole Blood'), 100);
  assert.equal(getDeficitScore(0, 'Platelets'), 100);
});

test('getDeficitScore: scales linearly with the gap to par level', () => {
  // Platelets par level is 6; stock of 3 is half the gap -> ~50.
  assert.equal(getDeficitScore(3, 'Platelets'), 50);
});

test('getDeficitScore: falls back to a default par level for unknown components', () => {
  // Unknown component -> default par level of 10 (see PAR_LEVEL fallback in source).
  assert.equal(getDeficitScore(0, 'Some Unknown Component'), 100);
  assert.equal(getDeficitScore(10, 'Some Unknown Component'), 0);
});

test('getExpiryScore: urgency increases as expiry approaches', () => {
  assert.equal(getExpiryScore(6), 100); // < 12h
  assert.equal(getExpiryScore(18), 80); // < 24h
  assert.equal(getExpiryScore(30), 55); // < 36h
  assert.equal(getExpiryScore(40), 30); // < 48h
  assert.equal(getExpiryScore(60), 10); // >= 48h
});

test('getDistanceScore: feasibility decreases with distance', () => {
  assert.equal(getDistanceScore(5), 100);
  assert.equal(getDistanceScore(20), 80);
  assert.equal(getDistanceScore(40), 55);
  assert.equal(getDistanceScore(60), 30);
  assert.equal(getDistanceScore(90), 10);
});

test('calculateDistance: distance from a point to itself is zero', () => {
  const d = calculateDistance(11.0168, 76.9558, 11.0168, 76.9558);
  assert.ok(Math.abs(d) < 1e-6);
});

test('calculateDistance: matches a known real-world distance (Coimbatore -> Chennai, ~370-500km great-circle)', () => {
  // Coimbatore (11.0168, 76.9558) to Chennai (13.0827, 80.2707).
  const d = calculateDistance(11.0168, 76.9558, 13.0827, 80.2707);
  assert.ok(d > 350 && d < 500, `expected ~350-500km, got ${d}`);
});

test('determinePriority: near-expiry always critical regardless of deficit', () => {
  assert.equal(determinePriority(6, 0), 'critical');
});

test('determinePriority: severe deficit always critical regardless of expiry', () => {
  assert.equal(determinePriority(72, 90), 'critical');
});

test('determinePriority: low urgency on both axes is low priority', () => {
  assert.equal(determinePriority(72, 10), 'low');
});

test('calculateTransferTime: derived from distance at the fixed 40km/h assumption', () => {
  // 40km at 40km/h = 1 hour = 60 minutes.
  assert.equal(calculateTransferTime(40), 60);
});

test('COMPATIBILITY: O- is the universal donor (compatible with all 8 groups)', () => {
  assert.equal(COMPATIBILITY['O-'].length, 8);
});

test('COMPATIBILITY: AB+ is the universal recipient only (can only give to AB+)', () => {
  assert.deepEqual(COMPATIBILITY['AB+'], ['AB+']);
});

test('WEIGHTS: the four composite-score weights sum to 1', () => {
  const total = WEIGHTS.expiry + WEIGHTS.deficit + WEIGHTS.distance + WEIGHTS.compatibility;
  assert.ok(Math.abs(total - 1) < 1e-9, `weights must sum to 1, got ${total}`);
});

test('PAR_LEVEL: platelets have a lower par level than whole blood (shorter shelf life)', () => {
  assert.ok(PAR_LEVEL.Platelets < PAR_LEVEL['Whole Blood']);
});
