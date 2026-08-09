const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ewma,
  linearRegression,
  stdDev,
  computeConfidence,
  riskLevelFor,
  trendDirection,
} = require('../forecastService');

test('ewma: constant series smooths to that constant', () => {
  const result = ewma([5, 5, 5, 5, 5], 0.3);
  assert.ok(Math.abs(result - 5) < 1e-9);
});

test('ewma: empty series returns 0', () => {
  assert.equal(ewma([], 0.3), 0);
});

test('linearRegression: perfectly increasing series has slope 1', () => {
  const { slope, intercept } = linearRegression([0, 1, 2, 3, 4]);
  assert.ok(Math.abs(slope - 1) < 1e-9);
  assert.ok(Math.abs(intercept - 0) < 1e-9);
});

test('linearRegression: flat series has slope 0', () => {
  const { slope } = linearRegression([7, 7, 7, 7]);
  assert.equal(slope, 0);
});

test('linearRegression: fewer than 2 points returns slope 0', () => {
  assert.deepEqual(linearRegression([]), { slope: 0, intercept: 0 });
  assert.deepEqual(linearRegression([9]), { slope: 0, intercept: 9 });
});

test('stdDev: constant series has zero standard deviation', () => {
  assert.equal(stdDev([4, 4, 4], 4), 0);
});

test('computeConfidence: thin history (<7 points) yields low, data-scaled confidence', () => {
  const c3 = computeConfidence([1, 2, 3], 2);
  const c6 = computeConfidence([1, 2, 3, 4, 5, 6], 3.5);
  assert.ok(c3 < 50, `expected low confidence for 3 points, got ${c3}`);
  assert.ok(c6 > c3, 'more thin-history points should not score lower than fewer');
});

test('computeConfidence: stable series (low variance) scores higher than volatile series', () => {
  const stable = new Array(21).fill(5); // no variance at all
  const volatile = [1, 20, 2, 18, 3, 17, 1, 19, 2, 20, 1, 18, 3, 19, 2, 20, 1, 17, 2, 18, 1];
  const meanStable = 5;
  const meanVolatile = volatile.reduce((a, b) => a + b, 0) / volatile.length;

  const stableConfidence = computeConfidence(stable, meanStable);
  const volatileConfidence = computeConfidence(volatile, meanVolatile);

  assert.ok(
    stableConfidence > volatileConfidence,
    `stable series (${stableConfidence}) should score higher than volatile (${volatileConfidence})`
  );
});

test('riskLevelFor: risk tiers match days-until-stockout thresholds', () => {
  assert.equal(riskLevelFor(0.5), 'critical');
  assert.equal(riskLevelFor(1.5), 'high');
  assert.equal(riskLevelFor(3), 'medium');
  assert.equal(riskLevelFor(10), 'low');
});

test('trendDirection: classifies slope into rising/falling/stable', () => {
  assert.equal(trendDirection(0.5), 'rising');
  assert.equal(trendDirection(-0.5), 'falling');
  assert.equal(trendDirection(0.05), 'stable');
});
