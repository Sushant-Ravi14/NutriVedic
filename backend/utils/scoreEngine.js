/**
 * NutriVedic Score Engine
 * Calculates consume scores and verdicts for food scan and freshness detection.
 */

/**
 * Maps a numeric score (0–100) to a human-readable verdict.
 * @param {number} score
 * @returns {{ emoji: string, label: string, color: string }}
 */
const scoreToVerdict = (score) => {
  if (score >= 75) return { emoji: '✅', label: 'Safe to consume', color: 'green' };
  if (score >= 50) return { emoji: '⚠️', label: 'Consume soon', color: 'yellow' };
  if (score >= 25) return { emoji: '🔴', label: 'Use with caution', color: 'orange' };
  return { emoji: '❌', label: 'Do not consume', color: 'red' };
};

/**
 * Calculates a consume score for an identified food item.
 * Based on Gemini confidence + whether nutrition data was resolved.
 *
 * @param {number} geminiConfidence  - 0 to 1 float from Gemini
 * @param {object} nutrition         - resolved nutrition object
 * @param {string} nutritionSource   - 'usda' | 'off' | 'gemini_estimate'
 * @returns {{ consumeScore: number, scoreVerdict: object }}
 */
const calculateConsumeScore = (geminiConfidence, nutrition, nutritionSource) => {
  // Base: confidence scaled to 100
  let score = Math.round(geminiConfidence * 100);

  // Bonus: if we have real nutrition data (not just an estimate)
  if (nutritionSource === 'usda') score = Math.min(100, score + 10);
  else if (nutritionSource === 'off') score = Math.min(100, score + 5);
  // Penalty: if we had to fallback to Gemini estimate for nutrition
  else if (nutritionSource === 'gemini_estimate') score = Math.max(0, score - 10);

  // Bonus: if calories are populated (means nutrition resolved properly)
  if (nutrition && nutrition.calories && nutrition.calories > 0) {
    score = Math.min(100, score + 5);
  }

  return {
    consumeScore: score,
    scoreVerdict: scoreToVerdict(score)
  };
};

/**
 * Calculates a freshness score verdict for produce.
 * Maps Gemini freshness class + raw score to a standardized verdict.
 *
 * @param {number} freshnessScore   - 0 to 100
 * @param {string} status           - 'Fresh' | 'Ripe' | 'Stale' | 'Spoiled'
 * @param {boolean} safeToEat       - from Gemini
 * @returns {{ finalScore: number, scoreVerdict: object }}
 */
const calculateFreshnessVerdict = (freshnessScore, status, safeToEat) => {
  // Status-based base score mapping
  const statusBaseScores = {
    Fresh: 88,
    Ripe: 65,
    Stale: 35,
    Spoiled: 8,
    Overripe: 40,
    Unsafe: 5
  };

  // Blend vision score with status base score (60% vision, 40% status)
  const statusBase = statusBaseScores[status] ?? 50;
  let finalScore = Math.round((freshnessScore * 0.6) + (statusBase * 0.4));

  // Hard override: if Gemini says NOT safe to eat, cap score at 24
  if (safeToEat === false) {
    finalScore = Math.min(finalScore, 24);
  }

  finalScore = Math.max(0, Math.min(100, finalScore));

  return {
    finalScore,
    scoreVerdict: scoreToVerdict(finalScore)
  };
};

/**
 * Freshness class mapping used by YOLO freshness model (9 classes).
 * Maps YOLO class name → { category, baseScore }
 */
const YOLO_FRESHNESS_MAP = {
  fresh_fruit:      { category: 'fresh',   baseScore: 90 },
  ripe_fruit:       { category: 'ripe',    baseScore: 68 },
  stale_fruit:      { category: 'stale',   baseScore: 35 },
  fresh_vegetable:  { category: 'fresh',   baseScore: 88 },
  ripe_vegetable:   { category: 'ripe',    baseScore: 65 },
  stale_vegetable:  { category: 'stale',   baseScore: 32 },
  fresh_leafy:      { category: 'fresh',   baseScore: 85 },
  wilted_leafy:     { category: 'stale',   baseScore: 28 },
  spoiled:          { category: 'spoiled', baseScore: 8  }
};

/**
 * Maps YOLO freshness class + confidence to a freshnessScore.
 * finalScore = baseScore * confidence (clamped 0-100)
 *
 * @param {string} yoloClass      - one of the 9 freshness class names
 * @param {number} yoloConfidence - 0 to 1
 * @returns {{ freshnessScore: number, freshnessCategory: string }}
 */
const yoloFreshnessScore = (yoloClass, yoloConfidence) => {
  const mapping = YOLO_FRESHNESS_MAP[yoloClass];
  if (!mapping) return { freshnessScore: 50, freshnessCategory: 'ripe' };

  const freshnessScore = Math.max(0, Math.min(100, Math.round(mapping.baseScore * yoloConfidence)));
  return {
    freshnessScore,
    freshnessCategory: mapping.category
  };
};

module.exports = {
  scoreToVerdict,
  calculateConsumeScore,
  calculateFreshnessVerdict,
  yoloFreshnessScore,
  YOLO_FRESHNESS_MAP
};
