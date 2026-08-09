const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Food Gate + Identification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identifies food in an image using Gemini Vision.
 * Acts as a two-in-one food gate + identifier.
 * Optionally accepts a yoloHint from the frontend for additional context.
 *
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {{ yoloClass: string, yoloConfidence: number }|null} yoloHint
 * @returns {object} parsed JSON result
 */
const identifyFood = async (imageBuffer, mimeType = 'image/jpeg', yoloHint = null) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const yoloContext = yoloHint
    ? `\nAdditional context from object detection model: The image contains what appears to be "${yoloHint.yoloClass}" with ${(yoloHint.yoloConfidence * 100).toFixed(0)}% confidence. Use this as a hint but do not be constrained by it — identify the specific Indian dish name.`
    : '';

  const prompt = `You are an expert in Indian cuisine and food nutrition with deep knowledge of regional Indian dishes.
${yoloContext}

FIRST: Determine if the image contains actual food that a human can eat.
- If the image is of a non-food object (wood, plastic, metal, furniture, human, animal, vehicle, clothing, electronics, etc.) — immediately return: { "isFood": false, "reason": "brief description of what was seen instead" }
- If the image is blurry, dark, or unidentifiable — return: { "isFood": false, "reason": "image too unclear to identify" }

IF it is food, analyze the image carefully and return ONLY a valid JSON object with no markdown formatting:
{
  "isFood": true,
  "foodName": "specific Indian dish name — be precise, e.g. 'Moong Dal Tadka' not just 'Dal', 'Methi Paratha' not just 'Paratha'",
  "alternateNames": ["other names this dish is known by"],
  "estimatedWeightGrams": estimated portion weight as a number,
  "confidence": your confidence as a number between 0 and 1,
  "cuisineType": "one of: North Indian, South Indian, Bengali, Gujarati, Maharashtrian, Street Food, Packaged, International, Other",
  "mainIngredients": ["list the top 5 visible or expected ingredients"],
  "portionDescription": "natural language description e.g. one standard katori, two medium rotis",
  "isIndianFood": true or false
}

If confidence is below 0.4 even though it looks like food, return:
{ "isFood": true, "unidentified": true, "reason": "brief explanation — e.g. image too blurry, dish not recognizable" }

Never return markdown. Never wrap JSON in backticks. Return only raw JSON.`;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    }
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    // Strip markdown fences
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    // Try direct parse first
    try {
      return JSON.parse(responseText);
    } catch (_) {
      // Fallback: extract JSON substring
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini response as JSON');
    }
  } catch (error) {
    console.error('Gemini identifyFood Error:', error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Produce Freshness Vision Analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyzes a produce image using Gemini Vision for freshness detection.
 * Acts as a food gate (is this fruit/vegetable?) + freshness assessor.
 *
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @returns {object} freshness assessment result
 */
const analyzeProduceFreshness = async (imageBuffer, mimeType = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a food safety expert and agricultural scientist specializing in fresh produce quality assessment.

FIRST: Determine if the image contains a fruit, vegetable, or fresh produce item.
- If the image is NOT produce (e.g., it is wood, plastic, cooked food, packaged food, a human, animal, vehicle, etc.) — immediately return:
  { "isProduce": false, "reason": "brief description of what was seen instead" }
- If the image is blurry or unidentifiable — return:
  { "isProduce": false, "reason": "image too unclear to assess" }

IF it is produce, analyze it carefully for freshness, ripeness, spoilage signs, and safety. Look closely at:
- Color uniformity or discoloration
- Surface texture (smooth, wrinkled, mushy, firm)
- Visible mold spots, brown patches, rot areas
- Wilting or structural integrity

Return ONLY valid raw JSON, no markdown, no backticks:
{
  "isProduce": true,
  "foodIdentified": "name of the fruit or vegetable",
  "freshnessScore": a number from 0 to 100 (100 = perfectly fresh, 0 = completely spoiled),
  "status": "one of exactly: Fresh, Ripe, Overripe, Stale, Spoiled",
  "safeToEat": true or false,
  "confidence": your detection confidence as a number 0 to 1,
  "spoilageSigns": ["list any visible signs like 'brown spots', 'mold', 'wilting', or ['none'] if perfectly fresh"],
  "storageAdvice": "one specific sentence on how to store this item right now"
}

Scoring guide:
- Fresh (no signs of aging): 80–100
- Ripe (at peak ripeness, consume now): 60–79
- Overripe (past peak but edible): 40–59
- Stale (significant degradation): 20–39
- Spoiled (unsafe, discard): 0–19

Never return markdown. Return only raw JSON.`;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    }
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(responseText);
    } catch (_) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini freshness vision response as JSON');
    }
  } catch (error) {
    console.error('Gemini analyzeProduceFreshness Error:', error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3 — Shelf Life + Nutrition Tip (text model)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimates shelf life, storage tips, and nutrition state for produce.
 * Called AFTER analyzeProduceFreshness to get detailed guidance.
 *
 * @param {string} itemName
 * @param {number} freshnessScore   - 0 to 100
 * @param {string} freshnessClass   - Fresh | Ripe | Overripe | Stale | Spoiled
 * @returns {object} shelf life and nutrition guidance
 */
const estimateFreshness = async (itemName, freshnessScore, freshnessClass) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a food scientist and nutritionist specializing in fresh produce quality assessment.

Produce item: ${itemName}
Freshness score from computer vision model: ${freshnessScore}/100
Freshness classification: ${freshnessClass}

Based on this assessment, provide storage and nutrition guidance.
Return ONLY valid raw JSON, no markdown, no backticks:
{
  "estimatedDaysRemaining": number of days before spoilage (0 if already spoiled),
  "bestConsumedWithin": number of days for peak nutritional value,
  "shelfLifeTip": "one specific storage recommendation, mention refrigeration or room temperature as appropriate",
  "nutritionNote": "one sentence about how nutritional content changes as this item ages past its peak",
  "avoidIfDescription": "brief description of visual signs that mean this item should be discarded",
  "nutritionAtCurrentState": {
    "vitaminRetentionPercent": estimated percentage of original vitamins still present as a number,
    "note": "one sentence about the current nutritional state"
  }
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(responseText);
    } catch (_) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini estimateFreshness response');
    }
  } catch (error) {
    console.error('Gemini estimateFreshness Error:', error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 4 — Diet Plan Generation
// ─────────────────────────────────────────────────────────────────────────────

const generateDietPlan = async ({ age, gender, heightCm, weightKg, activityLevel, goal, healthConditions, targetKcal, proteinTargetG }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const conditionsList = healthConditions && healthConditions.length > 0 ? healthConditions.join(', ') : 'None';

  const prompt = `You are a registered dietitian specializing in Indian nutrition and therapeutic diets.
Generate a 7-day personalized meal plan for this patient:
Age: ${age} | Sex: ${gender} | Height: ${heightCm}cm | Weight: ${weightKg}kg
Activity: ${activityLevel} | Goal: ${goal}
Health conditions: ${conditionsList}
Daily calorie target: ${targetKcal} kcal
Protein target: ${proteinTargetG}g

Strict rules:
1. All 28 meals must be Indian cuisine only
2. Diabetes: low GI foods, no white rice, no maida, no added sugar, prefer millets
3. Hypertension: sodium under 1500mg/day, no pickles, no papad
4. PCOD: anti-inflammatory, high fibre, omega-3 rich, balanced hormonal diet
5. Thyroid: avoid goitrogens (raw cabbage, cauliflower), include selenium foods
6. No meal repeated across 7 days — full variety
7. Include cooking time for each meal
8. All meals must be practical and easy to prepare at home

Return ONLY valid JSON:
{
  "plan": [
    {
      "day": 1,
      "breakfast": { "name": "", "description": "", "ingredients": [], "cookingTime": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "lunch": { "name": "", "description": "", "ingredients": [], "cookingTime": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "dinner": { "name": "", "description": "", "ingredients": [], "cookingTime": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
      "snack": { "name": "", "description": "", "ingredients": [], "cookingTime": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
    }
  ],
  "dietaryNotes": "",
  "avoidFoods": [],
  "preferFoods": []
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Diet Plan Error:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 5 — Meal Swap
// ─────────────────────────────────────────────────────────────────────────────

const swapMeal = async (userProfile, day, slot, existingMealName) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const conditionsList = userProfile.healthConditions ? userProfile.healthConditions.join(', ') : 'None';

  const prompt = `You are a registered dietitian specializing in Indian nutrition.
Generate ONE replacement meal for slot: ${slot} on day: ${day}.
Patient Profile - Goal: ${userProfile.goal}, Conditions: ${conditionsList}.
The new meal MUST NOT be: "${existingMealName}".
It must be an Indian dish, healthy, and adhere to their health conditions.

Return ONLY valid JSON matching this exact structure:
{
  "name": "",
  "description": "",
  "ingredients": [],
  "cookingTime": 0,
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Swap Meal Error:', error);
    throw error;
  }
};

module.exports = {
  identifyFood,
  analyzeProduceFreshness,
  estimateFreshness,
  generateDietPlan,
  swapMeal
};
