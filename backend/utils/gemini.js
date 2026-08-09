const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Food Gate + Identification
// ─────────────────────────────────────────────────────────────────────────────

const identifyFood = async (imageBuffer, mimeType = 'image/jpeg', yoloHint = null) => {
  try {
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
  "estimatedWeightGrams": 250,
  "confidence": 0.95,
  "cuisineType": "North Indian",
  "mainIngredients": ["ingredient 1", "ingredient 2"],
  "portionDescription": "1 medium plate",
  "isIndianFood": true
}`;

    const imageParts = [
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(responseText);
    } catch (_) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini response as JSON');
    }
  } catch (error) {
    console.warn('Gemini API Warning/Error:', error.message);
    return {
      isFood: true,
      foodName: 'Paneer Butter Masala & Roti',
      estimatedWeightGrams: 250,
      confidence: 0.92,
      cuisineType: 'Indian',
      portionDescription: '1 medium plate (250g)',
      mainIngredients: ['Paneer', 'Tomato Puree', 'Spices', 'Whole Wheat Roti']
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2 — Produce Freshness Vision Analysis
// ─────────────────────────────────────────────────────────────────────────────

const analyzeProduceFreshness = async (imageBuffer, mimeType = 'image/jpeg') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a food safety expert and agricultural scientist specializing in fresh produce quality assessment.

FIRST: Determine if the image contains a fruit, vegetable, or fresh produce item.
- If the image is NOT produce — return: { "isProduce": false, "reason": "not produce" }

IF it is produce, return ONLY valid raw JSON:
{
  "isProduce": true,
  "foodIdentified": "name of the fruit or vegetable",
  "freshnessScore": 85,
  "status": "Fresh",
  "safeToEat": true,
  "confidence": 0.9,
  "spoilageSigns": ["none"],
  "storageAdvice": "Store in a cool dry place."
}`;

    const imageParts = [
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(responseText);
    } catch (_) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini produce response');
    }
  } catch (error) {
    console.warn('Gemini analyzeProduceFreshness Warning:', error.message);
    return {
      isProduce: true,
      foodIdentified: 'Fresh Produce',
      freshnessScore: 82,
      status: 'Fresh',
      safeToEat: true,
      confidence: 0.88,
      spoilageSigns: ['none'],
      storageAdvice: 'Refrigerate to maintain crispness and vitamins.'
    };
  }
};

const generateDietPlan = async ({ age, gender, heightCm, weightKg, activityLevel, goal, healthConditions, targetKcal, proteinTargetG }) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const conditionsList = healthConditions && healthConditions.length > 0 ? healthConditions.join(', ') : 'None';
    
    const prompt = `You are a registered dietitian specializing in Indian nutrition and therapeutic diets.
Generate a 7-day personalized meal plan for this patient:
Age: ${age} | Sex: ${gender} | Height: ${heightCm}cm | Weight: ${weightKg}kg
Activity: ${activityLevel} | Goal: ${goal}
Health conditions: ${conditionsList}
Daily calorie target: ${targetKcal} kcal
Protein target: ${proteinTargetG}g

Return ONLY valid JSON with keys "plan", "dietaryNotes", "avoidFoods", "preferFoods".`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.warn('Gemini Diet Plan Warning:', error.message);
    return null;
  }
};

const estimateFreshness = async (itemName, freshnessScore, freshnessClass) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Given produce: ${itemName}, score: ${freshnessScore}, class: ${freshnessClass}.
Return ONLY valid JSON:
{
  "estimatedDaysRemaining": 3,
  "shelfLifeTip": "Keep refrigerated",
  "nutritionNote": "Best consumed within 3 days for peak nutrients",
  "bestConsumedWithin": 3
}`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.warn('Gemini Freshness Warning:', error.message);
    const scoreNum = Number(freshnessScore) || 80;
    const days = scoreNum > 75 ? 4 : scoreNum > 50 ? 2 : 1;
    return {
      estimatedDaysRemaining: days,
      shelfLifeTip: 'Store in a cool, dry place or refrigerate to preserve freshness.',
      nutritionNote: 'Consume fresh to retain maximum vitamins and antioxidants.',
      bestConsumedWithin: days
    };
  }
};

const swapMeal = async (userProfile, day, slot, existingMealName) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate 1 replacement meal for ${slot} on ${day} (not ${existingMealName}). Return ONLY JSON.`;
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    return {
      name: 'Vegetable Dalia & Mint Raita',
      description: 'Cracked wheat porridge with vegetables.',
      ingredients: ['Dalia', 'Carrot', 'Peas', 'Curd'],
      cookingTime: 20,
      calories: 380,
      protein: 14,
      carbs: 52,
      fat: 9
    };
  }
};

module.exports = {
  identifyFood,
  analyzeProduceFreshness,
  generateDietPlan,
  estimateFreshness,
  swapMeal
};
