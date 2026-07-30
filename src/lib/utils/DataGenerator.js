// Three ad categories — chosen because Employment and Housing are the
// two domains under real legal scrutiny (Title VII, Fair Housing Act)
// in the real-world ad-delivery discrimination research.
const CATEGORIES = ["Employment", "Housing", "Retail"];

// Baseline "difficulty" of each category — how likely an eligible
// impression actually gets delivered, independent of group.
// Retail is easiest (broad, low-stakes); Employment/Housing are harder
// (platforms apply more scrutiny/narrower relevance targeting).
const CATEGORY_BASE_RATE = {
  Employment: 0.35,
  Housing: 0.30,
  Retail: 0.70
};

function randomBoolean(p) {
  return Math.random() < p;
}

// Decides which category a given impression falls into.
// `imbalance` (0 to 1) controls how concentrated Group A is in the
// harder categories vs Group B — this is the slider-controlled knob
// that creates (or removes) the paradox.
function pickCategory(group, imbalance) {
  let weights;
  if (group === "A") {
    weights = {
      Employment: 0.33 + imbalance * 0.30,
      Housing: 0.33 + imbalance * 0.30,
      Retail: 0.34 - imbalance * 0.30
    };
  } else {
    weights = {
      Employment: 0.33 - imbalance * 0.15,
      Housing: 0.33 - imbalance * 0.15,
      Retail: 0.34 + imbalance * 0.30
    };
  }
  // Ensure no category ever hits exactly zero — every group should
  // retain at least a small presence everywhere, which is more
  // realistic and avoids "n/a" gaps in the data.
  Object.keys(weights).forEach((k) => (weights[k] = Math.max(weights[k], 0.05)));

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let cumulative = 0;
  for (const cat of CATEGORIES) {
    cumulative += weights[cat];
    if (r <= cumulative) return cat;
  }
  return CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Generates synthetic ad-delivery records.
 *
 * @param {number} totalImpressions - how many ad impressions to simulate
 * @param {number} groupSplit - proportion of impressions shown to Group A (0-1)
 * @param {number} imbalance - 0 = groups evenly spread across categories,
 *                             1 = max concentration skew (the paradox driver)
 * @param {number} relevanceRate - baseline probability an impression is "relevant"
 */
export function generateAdData({
  totalImpressions = 5000,
  groupSplit = 0.5,
  imbalance = 0.6,
  relevanceRate = 0.5
} = {}) {
  const records = [];

  for (let i = 0; i < totalImpressions; i++) {
    const group = randomBoolean(groupSplit) ? "A" : "B";
    const category = pickCategory(group, imbalance);
    const relevant = randomBoolean(relevanceRate);

    const baseRate = CATEGORY_BASE_RATE[category];
    // Relevant impressions get a delivery boost; irrelevant ones get
    // suppressed — but notice: no direct group effect is coded in here.
    // Any gap that shows up between groups comes purely from how they're
    // distributed across categories, not from the delivery logic itself.
    const deliveryProb = relevant
      ? Math.min(baseRate + 0.15, 0.95)
      : baseRate * 0.6;
    const delivered = randomBoolean(deliveryProb);

    records.push({ group, category, relevant, delivered });
  }

  return records;
}

export { CATEGORIES, CATEGORY_BASE_RATE };