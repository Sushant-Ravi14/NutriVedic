const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const identifyFood = async (imageBuffer, mimeType = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const prompt = `You are a food recognition expert specializing in Indian cuisine.
Analyze this image and return ONLY valid JSON, no markdown, no explanation:
{
  "foodName": "specific Indian dish name",
  "estimatedWeightGrams": number,
  "confidence": number between 0 and 1,
  "cuisineType": "Indian/International/Packaged",
  "servingDescription": "e.g. one medium bowl",
  "mainIngredients": ["array of visible ingredients"],
  "isFood": true or false
}
If not food: { "isFood": false }`;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType
      }
    }
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    let responseText = result.response.text();
    // Strip markdown formatting if any
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

const generateDietPlan = async ({ age, gender, heightCm, weightKg, activityLevel, goal, healthConditions, targetKcal, proteinTargetG }) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  
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

const estimateFreshness = async (itemName, freshnessScore, freshnessClass) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  const prompt = `You are a food scientist. Given this produce item:
Item: ${itemName}
Freshness score: ${freshnessScore}/100
Freshness class: ${freshnessClass}
Return ONLY valid JSON:
{
  "estimatedDaysRemaining": number,
  "shelfLifeTip": "storage recommendation in one sentence",
  "nutritionNote": "how nutrient content changes with time, one sentence",
  "bestConsumedWithin": number
}`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini Freshness Error:', error);
    throw error;
  }
};

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
  generateDietPlan,
  estimateFreshness,
  swapMeal
};
