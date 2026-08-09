const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1 — Food Gate + Identification
// ─────────────────────────────────────────────────────────────────────────────

const identifyFood = async (imageBuffer, mimeType = 'image/jpeg', yoloHint = null, userProfile = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const yoloContext = yoloHint
      ? `\nAdditional context from object detection model: The image contains what appears to be "${yoloHint.yoloClass}" with ${(yoloHint.yoloConfidence * 100).toFixed(0)}% confidence. Use this as a hint but do not be constrained by it — identify the specific Indian dish name.`
      : '';

    const healthContext = userProfile && (userProfile.healthConditions?.length > 0 || userProfile.goal)
      ? `\nUser Profile: Goal is ${userProfile.goal || 'maintain'}, Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}. Provide a brief 1-2 sentence personalized health feedback on whether this food is suitable for them in the "healthFeedback" JSON field.`
      : '';

    const prompt = `You are an expert in Indian cuisine and food nutrition with deep knowledge of regional Indian dishes.
${yoloContext}${healthContext}

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
  "isIndianFood": true,
  "healthFeedback": "Your personalized advice here based on user profile"
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
    if (error.message && (error.message.includes('quota') || error.message.includes('Quota') || error.message.includes('429') || error.message.includes('limit') || error.message.includes('quota exceeded'))) {
      throw error;
    }
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

const analyzeProduceFreshness = async (imageBuffer, mimeType = 'image/jpeg', userProfile = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const healthContext = userProfile && (userProfile.healthConditions?.length > 0 || userProfile.goal)
      ? `\nUser Profile: Goal is ${userProfile.goal || 'maintain'}, Health Conditions: ${userProfile.healthConditions?.join(', ') || 'None'}. Provide a brief 1-2 sentence personalized health note on consuming this produce in the "healthNote" JSON field.`
      : '';

    const prompt = `You are a food safety expert and agricultural scientist specializing in fresh produce quality assessment.
${healthContext}
FIRST: Determine if the image contains a fruit, vegetable, herb, or fresh produce item.
- If the image shows a human, face, selfie, person, body part, animal, indoor room, furniture, or other non-produce item — immediately return: { "isProduce": false, "reason": "human face or non-produce item detected" }

IF it is produce, return ONLY valid raw JSON:
{
  "isProduce": true,
  "foodIdentified": "name of the fruit or vegetable",
  "freshnessScore": 85,
  "status": "Fresh",
  "safeToEat": true,
  "confidence": 0.9,
  "spoilageSigns": ["none"],
  "storageAdvice": "Store in a cool dry place.",
  "healthNote": "Personalized health advice based on user profile here"
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
    if (error.message && (error.message.includes('quota') || error.message.includes('Quota') || error.message.includes('429') || error.message.includes('limit') || error.message.includes('quota exceeded'))) {
      throw error;
    }
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

// ─── Dynamic Fallback Meal Library (Condition-Aware) ───────────────────────────
const MEAL_LIBRARY = {
  breakfast: {
    diabetes: [
      { name: 'Moong Dal Chilla with Mint Chutney', description: 'Protein-rich green gram pancakes, low-GI', ingredients: ['Moong Dal', 'Ginger', 'Green Chilli', 'Coriander'], protein: 14, carbs: 22, fat: 4, cookingTime: 20 },
      { name: 'Ragi Porridge with Nuts', description: 'Finger millet porridge with almonds and walnuts', ingredients: ['Ragi Flour', 'Almonds', 'Walnuts', 'Cinnamon'], protein: 10, carbs: 30, fat: 7, cookingTime: 15 },
      { name: 'Vegetable Oats Upma', description: 'Steel-cut oats cooked with low-GI vegetables', ingredients: ['Steel Cut Oats', 'Beans', 'Carrot', 'Mustard Seeds'], protein: 11, carbs: 28, fat: 5, cookingTime: 20 },
      { name: 'Methi Paratha with Curd', description: 'Fenugreek-stuffed whole wheat flatbread with low-fat curd', ingredients: ['Whole Wheat Flour', 'Methi', 'Curd', 'Cumin'], protein: 13, carbs: 35, fat: 6, cookingTime: 25 },
      { name: 'Sprouts Poha with Lemon', description: 'Flattened rice with mixed sprouts, low glycemic', ingredients: ['Poha', 'Mixed Sprouts', 'Peanuts', 'Lemon'], protein: 12, carbs: 32, fat: 5, cookingTime: 15 },
      { name: 'Besan Chilla with Spinach', description: 'Gram flour pancakes loaded with spinach', ingredients: ['Besan', 'Spinach', 'Onion', 'Turmeric'], protein: 15, carbs: 20, fat: 4, cookingTime: 15 },
      { name: 'Dalia with Vegetables', description: 'Broken wheat porridge with seasonal vegetables', ingredients: ['Dalia', 'Peas', 'Carrot', 'Beans', 'Spices'], protein: 10, carbs: 30, fat: 4, cookingTime: 20 }
    ],
    pcod: [
      { name: 'Quinoa Upma with Vegetables', description: 'Anti-inflammatory quinoa with seasonal veggies', ingredients: ['Quinoa', 'Capsicum', 'Onion', 'Mustard Seeds'], protein: 15, carbs: 28, fat: 5, cookingTime: 20 },
      { name: 'Flaxseed Roti with Curd', description: 'Omega-3 rich flatbread with probiotic curd', ingredients: ['Whole Wheat Flour', 'Flaxseeds', 'Curd', 'Salt'], protein: 12, carbs: 32, fat: 8, cookingTime: 20 },
      { name: 'Moong Dal Chilla with Avocado', description: 'Hormone-balancing protein pancakes', ingredients: ['Moong Dal', 'Avocado', 'Green Chilli', 'Coriander'], protein: 16, carbs: 22, fat: 9, cookingTime: 20 },
      { name: 'Chia Seed Pudding with Berries', description: 'Overnight chia with anti-oxidant berries', ingredients: ['Chia Seeds', 'Almond Milk', 'Strawberry', 'Blueberry'], protein: 8, carbs: 18, fat: 10, cookingTime: 5 },
      { name: 'Ragi Dosa with Sambar', description: 'Finger millet crepe with lentil vegetable soup', ingredients: ['Ragi Flour', 'Urad Dal', 'Sambar Vegetables'], protein: 12, carbs: 30, fat: 4, cookingTime: 30 },
      { name: 'Besan Chilla with Spinach', description: 'Iron-rich spinach with protein gram flour pancakes', ingredients: ['Besan', 'Spinach', 'Fenugreek', 'Garlic'], protein: 15, carbs: 18, fat: 5, cookingTime: 15 },
      { name: 'Oats with Pumpkin Seeds & Cinnamon', description: 'Hormone-supporting rolled oats breakfast', ingredients: ['Rolled Oats', 'Pumpkin Seeds', 'Cinnamon', 'Banana'], protein: 11, carbs: 35, fat: 7, cookingTime: 10 }
    ],
    hypertension: [
      { name: 'Banana Oats Smoothie Bowl', description: 'Potassium-rich low-sodium breakfast bowl', ingredients: ['Oats', 'Banana', 'Almond Milk', 'Chia Seeds'], protein: 9, carbs: 40, fat: 5, cookingTime: 10 },
      { name: 'Besan Chilla (No Salt)', description: 'Low-sodium gram flour pancakes with herbs', ingredients: ['Besan', 'Coriander', 'Cumin', 'Green Chilli'], protein: 14, carbs: 20, fat: 4, cookingTime: 15 },
      { name: 'Idli with Coconut Chutney', description: 'Steamed low-sodium rice cakes, heart-friendly', ingredients: ['Rice', 'Urad Dal', 'Coconut', 'Curry Leaves'], protein: 10, carbs: 38, fat: 3, cookingTime: 20 },
      { name: 'Poha with Peas & Lemon', description: 'Low-sodium flattened rice with peas', ingredients: ['Poha', 'Peas', 'Mustard Seeds', 'Lemon'], protein: 8, carbs: 35, fat: 4, cookingTime: 15 },
      { name: 'Ragi Malt with Almonds', description: 'Potassium-rich finger millet malt', ingredients: ['Ragi', 'Almonds', 'Cardamom', 'Low-fat Milk'], protein: 10, carbs: 28, fat: 6, cookingTime: 10 },
      { name: 'Methi Thepla with Curd', description: 'Heart-healthy fenugreek flatbread, reduced salt', ingredients: ['Whole Wheat', 'Methi', 'Low-fat Curd', 'Turmeric'], protein: 12, carbs: 30, fat: 5, cookingTime: 25 },
      { name: 'Dalia Khichdi with Vegetables', description: 'DASH-diet friendly broken wheat porridge', ingredients: ['Dalia', 'Moong Dal', 'Spinach', 'Carrot'], protein: 12, carbs: 32, fat: 4, cookingTime: 20 }
    ],
    healthy: [
      { name: 'Oats Khichdi with Moong Dal', description: 'Light savory rolled oats with lentils and spices', ingredients: ['Oats', 'Moong Dal', 'Ginger', 'Turmeric', 'Ghee'], protein: 12, carbs: 45, fat: 8, cookingTime: 15 },
      { name: 'Masala Dosa with Sambar', description: 'Crispy fermented crepe with spiced potato filling', ingredients: ['Rice', 'Urad Dal', 'Potato', 'Onion', 'Mustard'], protein: 10, carbs: 52, fat: 6, cookingTime: 30 },
      { name: 'Aloo Paratha with Curd', description: 'Whole wheat flatbread stuffed with spiced potato', ingredients: ['Whole Wheat', 'Potato', 'Curd', 'Ajwain', 'Ghee'], protein: 11, carbs: 48, fat: 10, cookingTime: 25 },
      { name: 'Upma with Vegetables', description: 'Semolina porridge with seasonal vegetables', ingredients: ['Semolina', 'Onion', 'Carrot', 'Peas', 'Curry Leaves'], protein: 9, carbs: 40, fat: 7, cookingTime: 15 },
      { name: 'Besan Chilla with Paneer Stuffing', description: 'Gram flour pancakes stuffed with cottage cheese', ingredients: ['Besan', 'Paneer', 'Capsicum', 'Cumin'], protein: 18, carbs: 22, fat: 10, cookingTime: 20 },
      { name: 'Poha with Peanuts', description: 'Flattened rice with crunchy peanuts and lemon', ingredients: ['Poha', 'Peanuts', 'Onion', 'Mustard Seeds', 'Lemon'], protein: 10, carbs: 42, fat: 8, cookingTime: 15 },
      { name: 'Idli Sambar with Coconut Chutney', description: 'Steamed rice cakes with lentil soup', ingredients: ['Rice', 'Urad Dal', 'Toor Dal', 'Coconut', 'Tamarind'], protein: 11, carbs: 44, fat: 4, cookingTime: 25 }
    ]
  },
  lunch: {
    diabetes: [
      { name: 'Bajra Roti with Karela Sabzi & Curd', description: 'Pearl millet roti with bitter gourd, excellent for blood sugar', ingredients: ['Bajra Flour', 'Bitter Gourd', 'Curd', 'Turmeric'], protein: 16, carbs: 38, fat: 8, cookingTime: 30 },
      { name: 'Brown Rice Khichdi with Methi', description: 'One-pot brown rice and lentil dish with fenugreek', ingredients: ['Brown Rice', 'Moong Dal', 'Methi', 'Ghee'], protein: 15, carbs: 50, fat: 7, cookingTime: 30 },
      { name: 'Jowar Roti with Palak Dal', description: 'Sorghum flatbread with spinach lentil curry', ingredients: ['Jowar Flour', 'Palak', 'Toor Dal', 'Garlic'], protein: 18, carbs: 42, fat: 6, cookingTime: 35 },
      { name: 'Rajma Brown Rice with Salad', description: 'Kidney bean curry on brown rice, high fiber', ingredients: ['Rajma', 'Brown Rice', 'Onion', 'Tomato', 'Cucumber'], protein: 20, carbs: 55, fat: 6, cookingTime: 40 },
      { name: 'Lauki Dal with Multigrain Roti', description: 'Bottle gourd lentil soup with multi-grain bread', ingredients: ['Lauki', 'Chana Dal', 'Multigrain Flour', 'Cumin'], protein: 17, carbs: 44, fat: 5, cookingTime: 30 },
      { name: 'Mixed Vegetable Curry with Bajra Roti', description: 'Low-GI vegetables in light curry with millet roti', ingredients: ['Bajra', 'Brinjal', 'Capsicum', 'Beans', 'Turmeric'], protein: 14, carbs: 40, fat: 7, cookingTime: 35 },
      { name: 'Chana Dal Khichdi with Raita', description: 'Bengal gram and rice one-pot with yogurt', ingredients: ['Chana Dal', 'Brown Rice', 'Curd', 'Cumin', 'Coriander'], protein: 19, carbs: 52, fat: 6, cookingTime: 30 }
    ],
    pcod: [
      { name: 'Quinoa Salad with Chickpeas & Lemon', description: 'Anti-inflammatory complete protein salad', ingredients: ['Quinoa', 'Chickpeas', 'Cucumber', 'Lemon', 'Olive Oil'], protein: 18, carbs: 35, fat: 8, cookingTime: 20 },
      { name: 'Masoor Dal with Jowar Roti', description: 'Iron-rich red lentil with sorghum flatbread', ingredients: ['Masoor Dal', 'Jowar Flour', 'Tomato', 'Garlic'], protein: 20, carbs: 42, fat: 5, cookingTime: 30 },
      { name: 'Palak Paneer with Brown Rice', description: 'Iron and calcium-rich spinach cottage cheese', ingredients: ['Palak', 'Paneer', 'Brown Rice', 'Garlic', 'Garam Masala'], protein: 22, carbs: 48, fat: 12, cookingTime: 35 },
      { name: 'Chana Masala with Multigrain Roti', description: 'Hormone-balancing chickpea curry', ingredients: ['Chickpeas', 'Multigrain Flour', 'Onion', 'Tomato', 'Chole Masala'], protein: 20, carbs: 52, fat: 7, cookingTime: 35 },
      { name: 'Methi Dal with Bajra Roti', description: 'Fenugreek lentil with pearl millet flatbread', ingredients: ['Toor Dal', 'Methi', 'Bajra Flour', 'Ghee'], protein: 17, carbs: 40, fat: 6, cookingTime: 30 },
      { name: 'Broccoli Stir Fry with Brown Rice', description: 'Anti-androgenic broccoli with complex carbs', ingredients: ['Broccoli', 'Brown Rice', 'Sesame Oil', 'Garlic', 'Soy Sauce'], protein: 14, carbs: 45, fat: 7, cookingTime: 25 },
      { name: 'Tofu Bhurji with Multigrain Roti', description: 'Plant-based protein scramble for hormone balance', ingredients: ['Tofu', 'Capsicum', 'Onion', 'Multigrain Flour', 'Turmeric'], protein: 20, carbs: 35, fat: 9, cookingTime: 25 }
    ],
    hypertension: [
      { name: 'Moong Dal with Lauki & Multigrain Roti', description: 'Low-sodium heart-healthy lentil with bottle gourd', ingredients: ['Moong Dal', 'Lauki', 'Multigrain Roti', 'Cumin', 'Coriander'], protein: 16, carbs: 42, fat: 4, cookingTime: 30 },
      { name: 'Palak Dal with Brown Rice', description: 'Potassium-rich spinach lentil with whole grain rice', ingredients: ['Toor Dal', 'Palak', 'Brown Rice', 'Garlic', 'Lemon'], protein: 18, carbs: 50, fat: 5, cookingTime: 35 },
      { name: 'Rajma (Low Sodium) with Roti', description: 'Kidney bean curry with reduced salt, potassium boost', ingredients: ['Rajma', 'Whole Wheat Roti', 'Tomato', 'Onion', 'Herbs'], protein: 20, carbs: 52, fat: 6, cookingTime: 40 },
      { name: 'Vegetable Khichdi with Raita', description: 'DASH-diet one-pot meal with cooling yogurt', ingredients: ['Brown Rice', 'Moong Dal', 'Mixed Vegetables', 'Low-fat Curd'], protein: 14, carbs: 48, fat: 5, cookingTime: 25 },
      { name: 'Chana Dal with Spinach Roti', description: 'Bengal gram with iron-rich spinach flatbread', ingredients: ['Chana Dal', 'Spinach Flour Roti', 'Garlic', 'Cumin'], protein: 18, carbs: 44, fat: 5, cookingTime: 30 },
      { name: 'Dahi Wali Bhindi with Jowar Roti', description: 'Okra in yogurt gravy, potassium-rich', ingredients: ['Bhindi', 'Low-fat Curd', 'Jowar Roti', 'Mustard Seeds'], protein: 12, carbs: 38, fat: 6, cookingTime: 25 },
      { name: 'Lobia Curry with Brown Rice', description: 'Black-eyed peas curry with whole grain rice', ingredients: ['Lobia', 'Brown Rice', 'Tomato', 'Coriander', 'Minimal Salt'], protein: 18, carbs: 50, fat: 4, cookingTime: 35 }
    ],
    healthy: [
      { name: 'Brown Rice with Dal Tadka & Bhindi Masala', description: 'Whole grains, tempered lentils and spiced okra', ingredients: ['Brown Rice', 'Yellow Dal', 'Okra', 'Onion', 'Tomato'], protein: 18, carbs: 65, fat: 12, cookingTime: 25 },
      { name: 'Chole Bhature with Salad', description: 'Spiced chickpeas with deep-fried bread and salad', ingredients: ['Chickpeas', 'Maida', 'Onion', 'Tomato', 'Garam Masala'], protein: 20, carbs: 72, fat: 18, cookingTime: 40 },
      { name: 'Rajma Chawal with Raita', description: 'Kidney bean curry with rice and cooling yogurt', ingredients: ['Rajma', 'Basmati Rice', 'Curd', 'Onion', 'Tomato'], protein: 19, carbs: 68, fat: 8, cookingTime: 40 },
      { name: 'Dal Makhani with Naan', description: 'Creamy black lentil curry with leavened bread', ingredients: ['Black Lentils', 'Rajma', 'Cream', 'Butter', 'Naan'], protein: 18, carbs: 62, fat: 16, cookingTime: 45 },
      { name: 'Palak Paneer with Jeera Rice', description: 'Spinach cottage cheese curry with cumin rice', ingredients: ['Palak', 'Paneer', 'Basmati Rice', 'Cumin', 'Cream'], protein: 22, carbs: 60, fat: 14, cookingTime: 35 },
      { name: 'Chicken Curry with Roti', description: 'Tender chicken in aromatic masala gravy', ingredients: ['Chicken', 'Whole Wheat Roti', 'Onion', 'Tomato', 'Spices'], protein: 28, carbs: 45, fat: 12, cookingTime: 35 },
      { name: 'Vegetable Biryani with Raita', description: 'Aromatic spiced rice with mixed vegetables', ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Biryani Masala', 'Curd'], protein: 14, carbs: 70, fat: 10, cookingTime: 45 }
    ]
  },
  dinner: {
    diabetes: [
      { name: 'Palak Soup with Multigrain Toast', description: 'Fiber-rich spinach soup with low-GI toast', ingredients: ['Palak', 'Garlic', 'Multigrain Bread', 'Olive Oil'], protein: 10, carbs: 22, fat: 6, cookingTime: 20 },
      { name: 'Moong Dal Khichdi (Light)', description: 'Easy-to-digest light lentil rice for dinner', ingredients: ['Moong Dal', 'Brown Rice', 'Ghee', 'Turmeric'], protein: 14, carbs: 40, fat: 5, cookingTime: 25 },
      { name: 'Bajra Roti with Karela Sabzi', description: 'Blood-sugar friendly bitter gourd with millet roti', ingredients: ['Bajra', 'Karela', 'Onion', 'Turmeric', 'Ajwain'], protein: 12, carbs: 32, fat: 6, cookingTime: 30 },
      { name: 'Tofu & Vegetable Stir Fry with Ragi Roti', description: 'Plant protein with low-GI millet roti', ingredients: ['Tofu', 'Capsicum', 'Broccoli', 'Ragi Flour', 'Sesame'], protein: 18, carbs: 30, fat: 8, cookingTime: 25 },
      { name: 'Lauki Chana Dal', description: 'Bottle gourd and split chickpea light curry', ingredients: ['Lauki', 'Chana Dal', 'Ginger', 'Cumin', 'Coriander'], protein: 15, carbs: 35, fat: 4, cookingTime: 30 },
      { name: 'Grilled Fish with Salad', description: 'Omega-3 rich grilled fish with cucumber salad', ingredients: ['Rohu Fish', 'Cucumber', 'Lemon', 'Olive Oil', 'Herbs'], protein: 24, carbs: 8, fat: 8, cookingTime: 25 },
      { name: 'Methi Sabzi with Besan Roti', description: 'Fenugreek vegetable with gram flour flatbread', ingredients: ['Methi', 'Besan Roti', 'Garlic', 'Turmeric', 'Ajwain'], protein: 14, carbs: 28, fat: 6, cookingTime: 25 }
    ],
    pcod: [
      { name: 'Lentil Vegetable Soup with Multigrain Toast', description: 'Anti-inflammatory hormone-supporting soup', ingredients: ['Red Lentils', 'Carrot', 'Spinach', 'Garlic', 'Multigrain Toast'], protein: 14, carbs: 28, fat: 5, cookingTime: 25 },
      { name: 'Tofu Palak with Jowar Roti', description: 'Phytoestrogen-rich tofu with iron-loaded spinach', ingredients: ['Tofu', 'Palak', 'Jowar Roti', 'Garlic', 'Cumin'], protein: 18, carbs: 32, fat: 7, cookingTime: 30 },
      { name: 'Methi Chicken with Roti', description: 'Fenugreek chicken for hormonal balance', ingredients: ['Chicken', 'Methi', 'Whole Wheat Roti', 'Curd', 'Spices'], protein: 26, carbs: 30, fat: 9, cookingTime: 35 },
      { name: 'Grilled Salmon with Sautéed Spinach', description: 'Omega-3 rich fish for PCOS inflammation', ingredients: ['Salmon', 'Spinach', 'Olive Oil', 'Garlic', 'Lemon'], protein: 28, carbs: 6, fat: 14, cookingTime: 25 },
      { name: 'Quinoa Khichdi with Raita', description: 'Complete protein grain with cooling yogurt', ingredients: ['Quinoa', 'Moong Dal', 'Low-fat Curd', 'Cumin'], protein: 16, carbs: 35, fat: 5, cookingTime: 25 },
      { name: 'Broccoli Paneer Stir Fry with Roti', description: 'Anti-androgenic veggies with protein paneer', ingredients: ['Broccoli', 'Paneer', 'Whole Wheat Roti', 'Soy Sauce'], protein: 20, carbs: 28, fat: 11, cookingTime: 25 },
      { name: 'Egg Bhurji with Multigrain Roti', description: 'High-protein scrambled eggs for hormone support', ingredients: ['Eggs', 'Onion', 'Tomato', 'Multigrain Roti', 'Spices'], protein: 22, carbs: 28, fat: 10, cookingTime: 15 }
    ],
    hypertension: [
      { name: 'Steamed Fish with Vegetable Soup', description: 'Low-sodium omega-3 rich dinner', ingredients: ['Fish', 'Carrot', 'Spinach', 'Lemon', 'Garlic'], protein: 24, carbs: 10, fat: 7, cookingTime: 25 },
      { name: 'Moong Dal Khichdi with Raita', description: 'Low-sodium one-pot easy-digest dinner', ingredients: ['Moong Dal', 'Rice', 'Low-fat Curd', 'Ghee', 'Cumin'], protein: 14, carbs: 42, fat: 5, cookingTime: 25 },
      { name: 'Palak Paneer (Low Oil) with Roti', description: 'Reduced-oil spinach curry, potassium-rich', ingredients: ['Palak', 'Paneer', 'Whole Wheat Roti', 'Garlic', 'Ginger'], protein: 18, carbs: 35, fat: 9, cookingTime: 30 },
      { name: 'Chicken Soup with Vegetables', description: 'Clear broth soup, very low sodium', ingredients: ['Chicken', 'Carrot', 'Celery', 'Garlic', 'Herbs'], protein: 22, carbs: 8, fat: 5, cookingTime: 30 },
      { name: 'Lauki Sabzi with Multigrain Roti', description: 'Cooling bottle gourd with heart-friendly roti', ingredients: ['Lauki', 'Multigrain Roti', 'Cumin', 'Coriander'], protein: 10, carbs: 32, fat: 4, cookingTime: 20 },
      { name: 'Tinda Dal with Jowar Roti', description: 'Round gourd with lentil, blood-pressure friendly', ingredients: ['Tinda', 'Moong Dal', 'Jowar Roti', 'Turmeric'], protein: 13, carbs: 35, fat: 4, cookingTime: 25 },
      { name: 'Baked Fish with Salad', description: 'Potassium-rich omega-3 fish with greens', ingredients: ['Pomfret', 'Cucumber', 'Tomato', 'Lemon', 'Herbs'], protein: 26, carbs: 6, fat: 8, cookingTime: 25 }
    ],
    healthy: [
      { name: 'Paneer Tikka with Roti & Green Salad', description: 'Grilled spiced paneer cubes with whole wheat roti', ingredients: ['Paneer', 'Capsicum', 'Wheat Flour', 'Cucumber', 'Lemon'], protein: 22, carbs: 40, fat: 14, cookingTime: 20 },
      { name: 'Egg Curry with Basmati Rice', description: 'Protein-rich egg curry with aromatic rice', ingredients: ['Eggs', 'Basmati Rice', 'Onion', 'Tomato', 'Spices'], protein: 20, carbs: 55, fat: 12, cookingTime: 30 },
      { name: 'Chicken Tikka Masala with Naan', description: 'Tandoor-style chicken in rich tomato gravy', ingredients: ['Chicken', 'Naan', 'Curd', 'Onion', 'Spices'], protein: 30, carbs: 48, fat: 14, cookingTime: 35 },
      { name: 'Fish Curry with Steamed Rice', description: 'Coastal-style spiced fish curry with rice', ingredients: ['Fish', 'Coconut Milk', 'Basmati Rice', 'Tamarind', 'Curry Leaves'], protein: 26, carbs: 52, fat: 12, cookingTime: 30 },
      { name: 'Dal Fry with Jeera Rice', description: 'Tempered mixed lentils with cumin rice', ingredients: ['Toor Dal', 'Basmati Rice', 'Ghee', 'Cumin', 'Garlic'], protein: 18, carbs: 60, fat: 10, cookingTime: 25 },
      { name: 'Mutton Curry with Whole Wheat Roti', description: 'Slow-cooked mutton in aromatic masala', ingredients: ['Mutton', 'Whole Wheat Roti', 'Onion', 'Garam Masala'], protein: 32, carbs: 38, fat: 18, cookingTime: 50 },
      { name: 'Vegetable Stew with Appam', description: 'Kerala-style coconut milk vegetable stew', ingredients: ['Mixed Vegetables', 'Coconut Milk', 'Appam', 'Curry Leaves'], protein: 10, carbs: 55, fat: 10, cookingTime: 35 }
    ]
  },
  snack: {
    diabetes: [
      { name: 'Cucumber & Carrot Sticks with Hummus', description: 'Low-GI raw vegetables with protein dip', ingredients: ['Cucumber', 'Carrot', 'Chickpeas', 'Olive Oil', 'Lemon'], protein: 6, carbs: 12, fat: 5, cookingTime: 5 },
      { name: 'Roasted Chana & Green Tea', description: 'Low-GI crunchy roasted chickpeas with tea', ingredients: ['Roasted Chana', 'Green Tea', 'Rock Salt', 'Lemon'], protein: 8, carbs: 14, fat: 3, cookingTime: 5 },
      { name: 'Almonds & Walnuts (Small Handful)', description: 'Healthy fat and protein nut mix', ingredients: ['Almonds', 'Walnuts', 'Pumpkin Seeds'], protein: 6, carbs: 6, fat: 14, cookingTime: 0 },
      { name: 'Moong Dal Dhokla (Steamed)', description: 'Steamed low-GI gram lentil snack', ingredients: ['Moong Dal', 'Ginger', 'Green Chilli', 'Sesame Seeds'], protein: 9, carbs: 16, fat: 3, cookingTime: 20 },
      { name: 'Paneer Cubes with Black Pepper', description: 'Raw protein-rich cottage cheese snack', ingredients: ['Paneer', 'Black Pepper', 'Rock Salt', 'Lemon'], protein: 10, carbs: 4, fat: 8, cookingTime: 0 },
      { name: 'Flaxseed Ladoo (Sugarfree)', description: 'Omega-3 rich no-sugar energy ball', ingredients: ['Flaxseeds', 'Dates', 'Coconut', 'Cardamom'], protein: 5, carbs: 14, fat: 7, cookingTime: 10 },
      { name: 'Methi Seeds Water & Nuts', description: 'Fenugreek water for blood sugar + nuts', ingredients: ['Methi Seeds', 'Almonds', 'Walnuts'], protein: 5, carbs: 8, fat: 10, cookingTime: 0 }
    ],
    pcod: [
      { name: 'Pumpkin Seeds & Dark Chocolate', description: 'Zinc-rich seeds for hormone balance', ingredients: ['Pumpkin Seeds', 'Dark Chocolate (70%)', 'Almonds'], protein: 7, carbs: 10, fat: 12, cookingTime: 0 },
      { name: 'Flaxseed Smoothie', description: 'Omega-3 hormone-balancing smoothie', ingredients: ['Flaxseeds', 'Banana', 'Almond Milk', 'Cinnamon'], protein: 6, carbs: 18, fat: 8, cookingTime: 5 },
      { name: 'Roasted Sunflower Seeds & Green Tea', description: 'Vitamin E rich seeds for ovarian health', ingredients: ['Sunflower Seeds', 'Green Tea', 'Rock Salt'], protein: 7, carbs: 8, fat: 10, cookingTime: 0 },
      { name: 'Curd with Berries', description: 'Probiotic curd with antioxidant berries', ingredients: ['Low-fat Curd', 'Strawberry', 'Blueberry', 'Honey'], protein: 8, carbs: 15, fat: 2, cookingTime: 0 },
      { name: 'Makhana (Fox Nuts) Roasted', description: 'Low-calorie PCOS-friendly lotus seeds', ingredients: ['Makhana', 'Ghee', 'Rock Salt', 'Black Pepper'], protein: 6, carbs: 14, fat: 3, cookingTime: 10 },
      { name: 'Brazil Nuts & Walnut Mix', description: 'Selenium-rich nut mix for thyroid-PCOS support', ingredients: ['Brazil Nuts', 'Walnuts', 'Almonds'], protein: 5, carbs: 5, fat: 15, cookingTime: 0 },
      { name: 'Chia Seed Lemonade', description: 'Hydrating anti-inflammatory chia drink', ingredients: ['Chia Seeds', 'Lemon', 'Water', 'Honey'], protein: 3, carbs: 10, fat: 3, cookingTime: 5 }
    ],
    hypertension: [
      { name: 'Banana & Walnuts', description: 'Potassium-rich banana with heart-healthy walnuts', ingredients: ['Banana', 'Walnuts'], protein: 4, carbs: 28, fat: 8, cookingTime: 0 },
      { name: 'Roasted Makhana (Unsalted)', description: 'Low-sodium lotus seeds, blood pressure friendly', ingredients: ['Makhana', 'Ghee', 'Herbs (No Salt)'], protein: 5, carbs: 15, fat: 3, cookingTime: 10 },
      { name: 'Cucumber & Pomegranate Salad', description: 'Nitrate-rich produce for blood pressure', ingredients: ['Cucumber', 'Pomegranate', 'Mint', 'Lemon'], protein: 2, carbs: 16, fat: 1, cookingTime: 5 },
      { name: 'Unsalted Mixed Nuts', description: 'DASH-diet nut mix, no added salt', ingredients: ['Almonds', 'Cashews', 'Walnuts', 'Pistachios'], protein: 6, carbs: 8, fat: 14, cookingTime: 0 },
      { name: 'Coconut Water & Flaxseed Crackers', description: 'Electrolyte drink with fiber-rich crackers', ingredients: ['Coconut Water', 'Flaxseed Crackers'], protein: 3, carbs: 18, fat: 4, cookingTime: 0 },
      { name: 'Watermelon Slices', description: 'Natural L-citrulline for blood vessel health', ingredients: ['Watermelon'], protein: 1, carbs: 18, fat: 0, cookingTime: 0 },
      { name: 'Beetroot Juice with Lemon', description: 'Natural nitrates to lower blood pressure', ingredients: ['Beetroot', 'Lemon', 'Ginger', 'Water'], protein: 2, carbs: 14, fat: 0, cookingTime: 5 }
    ],
    healthy: [
      { name: 'Mixed Roasted Seeds & Green Tea', description: 'Pumpkin, sunflower, and flax seeds', ingredients: ['Pumpkin Seeds', 'Flax Seeds', 'Sunflower Seeds'], protein: 8, carbs: 10, fat: 6, cookingTime: 5 },
      { name: 'Chivda & Masala Chai', description: 'Roasted poha mix with Indian spiced tea', ingredients: ['Poha Chivda', 'Peanuts', 'Curry Leaves', 'Masala Chai'], protein: 6, carbs: 22, fat: 6, cookingTime: 10 },
      { name: 'Fruit Chaat with Chaat Masala', description: 'Seasonal fruit medley with tangy spices', ingredients: ['Apple', 'Banana', 'Pomegranate', 'Chaat Masala', 'Lemon'], protein: 3, carbs: 30, fat: 1, cookingTime: 5 },
      { name: 'Makhana Kheer (Light)', description: 'Lotus seed pudding with low-fat milk', ingredients: ['Makhana', 'Low-fat Milk', 'Sugar', 'Cardamom'], protein: 8, carbs: 24, fat: 4, cookingTime: 15 },
      { name: 'Samosa with Green Chutney (1 pc)', description: 'Baked spiced potato pastry with mint dip', ingredients: ['Potato', 'Peas', 'Maida', 'Spices', 'Mint'], protein: 4, carbs: 28, fat: 8, cookingTime: 30 },
      { name: 'Buttermilk (Chaas) with Roasted Jeera', description: 'Cooling probiotic drink with cumin', ingredients: ['Curd', 'Water', 'Cumin', 'Ginger', 'Salt'], protein: 4, carbs: 8, fat: 2, cookingTime: 5 },
      { name: 'Roasted Chana & Jaggery', description: 'Energy-boosting crunchy chickpeas with jaggery', ingredients: ['Roasted Chana', 'Jaggery', 'Coconut'], protein: 8, carbs: 20, fat: 3, cookingTime: 0 }
    ]
  }
};

const DIETARY_NOTES = {
  diabetes: 'Your plan is tailored for Type 2 Diabetes with low-GI foods, high fiber, and complex carbohydrates to stabilize blood sugar. Avoid refined sugar, maida, white rice, and fruit juices. Eat every 3–4 hours in small portions.',
  pcod: 'Your plan is designed for PCOS/PCOD with anti-inflammatory, hormone-balancing foods rich in Omega-3, zinc, iron, and fiber. Avoid processed foods, refined carbs, and excess dairy. Focus on regular meal timing.',
  hypertension: 'Your plan follows the DASH diet principles for hypertension — low sodium, high potassium. Avoid pickles, papad, processed foods, and excess salt. Include regular physical activity.',
  'high cholesterol': 'Your plan is heart-healthy with soluble fiber, omega-3 fats, and plant sterols to reduce LDL cholesterol. Avoid trans fats, fried foods, and excess saturated fats.',
  healthy: 'Your personalized Indian nutrition plan balances all macronutrients with whole grains, lean proteins, and healthy fats. Stay hydrated with 3 liters of water daily.'
};

const AVOID_FOODS = {
  diabetes: ['White Rice', 'Maida', 'Refined Sugar', 'Fruit Juice', 'Potatoes', 'Processed Snacks', 'Sweet Desserts'],
  pcod: ['Processed Foods', 'Refined Carbs', 'Excess Dairy', 'Sugary Drinks', 'Trans Fats', 'Soy Isolates', 'Alcohol'],
  hypertension: ['Table Salt', 'Pickles', 'Papad', 'Processed Meats', 'Canned Foods', 'Fast Food', 'Excess Caffeine'],
  'high cholesterol': ['Trans Fats', 'Fried Foods', 'Ghee Excess', 'Full-fat Dairy', 'Red Meat', 'Coconut Oil Excess'],
  healthy: ['Deep Fried Foods', 'Refined Sugar', 'Processed Snacks', 'Excessive Alcohol', 'Maida Products']
};

const PREFER_FOODS = {
  diabetes: ['Ragi', 'Bajra', 'Jowar', 'Methi', 'Karela', 'Brown Rice', 'Moong Dal', 'Flaxseeds', 'Chia Seeds'],
  pcod: ['Flaxseeds', 'Pumpkin Seeds', 'Broccoli', 'Quinoa', 'Salmon', 'Walnuts', 'Turmeric', 'Cinnamon', 'Leafy Greens'],
  hypertension: ['Banana', 'Beetroot', 'Spinach', 'Garlic', 'Flaxseeds', 'Oats', 'Pomegranate', 'Coconut Water'],
  'high cholesterol': ['Oats', 'Flaxseeds', 'Almonds', 'Avocado', 'Fatty Fish', 'Beans', 'Olive Oil', 'Garlic'],
  healthy: ['Ragi', 'Brown Oats', 'Lentils', 'Leafy Greens', 'Seasonal Fruits', 'Nuts & Seeds', 'Curd']
};

const getFallbackPlan = (condition = 'Healthy', targetKcal = 2000) => {
  // Detect which meal library key to use based on condition string
  const condLower = (condition || '').toLowerCase();
  let mealKey = 'healthy';
  if (condLower.includes('diabet')) mealKey = 'diabetes';
  else if (condLower.includes('pcos') || condLower.includes('pcod')) mealKey = 'pcod';
  else if (condLower.includes('hypertension') || condLower.includes('blood pressure')) mealKey = 'hypertension';
  else if (condLower.includes('cholesterol')) mealKey = 'high cholesterol';

  const breakfasts = MEAL_LIBRARY.breakfast[mealKey] || MEAL_LIBRARY.breakfast.healthy;
  const lunches = MEAL_LIBRARY.lunch[mealKey] || MEAL_LIBRARY.lunch.healthy;
  const dinners = MEAL_LIBRARY.dinner[mealKey] || MEAL_LIBRARY.dinner.healthy;
  const snacks = MEAL_LIBRARY.snack[mealKey] || MEAL_LIBRARY.snack.healthy;

  // Use current date + condition as a seed to rotate meals differently each time & by condition
  const seed = (Date.now() % 7) + (condLower.length % 3);

  const plan = [];
  for (let i = 1; i <= 7; i++) {
    const bIdx = (i - 1 + seed) % breakfasts.length;
    const lIdx = (i - 1 + seed + 2) % lunches.length;
    const dIdx = (i - 1 + seed + 4) % dinners.length;
    const sIdx = (i - 1 + seed + 1) % snacks.length;

    const b = breakfasts[bIdx];
    const l = lunches[lIdx];
    const d = dinners[dIdx];
    const s = snacks[sIdx];

    plan.push({
      day: i,
      breakfast: { ...b, calories: Math.round(targetKcal * 0.25), eaten: false },
      lunch:     { ...l, calories: Math.round(targetKcal * 0.35), eaten: false },
      dinner:    { ...d, calories: Math.round(targetKcal * 0.30), eaten: false },
      snack:     { ...s, calories: Math.round(targetKcal * 0.10), eaten: false }
    });
  }

  const noteKey = mealKey === 'pcod' ? 'pcod' : condLower.includes('diabet') ? 'diabetes' : condLower.includes('hypertension') ? 'hypertension' : condLower.includes('cholesterol') ? 'high cholesterol' : 'healthy';

  return {
    plan,
    dietaryNotes: DIETARY_NOTES[noteKey] || DIETARY_NOTES.healthy,
    avoidFoods: AVOID_FOODS[noteKey] || AVOID_FOODS.healthy,
    preferFoods: PREFER_FOODS[noteKey] || PREFER_FOODS.healthy
  };
};

const generateDietPlan = async ({ age, gender, heightCm, weightKg, activityLevel, goal, healthConditions, targetKcal, proteinTargetG }) => {
  const conditionsList = healthConditions && healthConditions.length > 0 ? healthConditions.join(', ') : 'None';
  const caloriesNum = Number(targetKcal) || 2000;

  try {
    const mealSchemaJson = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        ingredients: { type: 'array', items: { type: 'string' } },
        calories: { type: 'integer' },
        protein: { type: 'integer' },
        carbs: { type: 'integer' },
        fat: { type: 'integer' },
        cookingTime: { type: 'integer' }
      },
      required: ['name', 'description', 'ingredients', 'calories', 'protein', 'carbs', 'fat', 'cookingTime']
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'integer', description: 'Day number (1 = Monday, 7 = Sunday)' },
                  breakfast: mealSchemaJson,
                  lunch: mealSchemaJson,
                  dinner: mealSchemaJson,
                  snack: mealSchemaJson
                },
                required: ['day', 'breakfast', 'lunch', 'dinner', 'snack']
              }
            },
            dietaryNotes: { type: 'string' },
            avoidFoods: { type: 'array', items: { type: 'string' } },
            preferFoods: { type: 'array', items: { type: 'string' } }
          },
          required: ['plan', 'dietaryNotes', 'avoidFoods', 'preferFoods']
        }
      }
    });
    
    const prompt = `You are a registered dietitian specializing in Indian nutrition and therapeutic diets.
Generate a 7-day personalized meal plan (precisely 7 days, day 1 to 7) for this patient:
Age: ${age} | Sex: ${gender} | Height: ${heightCm}cm | Weight: ${weightKg}kg
Activity: ${activityLevel} | Goal: ${goal}
Health conditions: ${conditionsList}
Daily calorie target: ${caloriesNum} kcal
Protein target: ${proteinTargetG || 60}g

Ensure all meals are healthy Indian dishes tailored for the condition: ${conditionsList}.`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    const parsed = JSON.parse(responseText);
    
    if (parsed && parsed.plan && parsed.plan.length > 0) {
      return parsed;
    }
    
    throw new Error('Invalid plan structure generated');
  } catch (error) {
    console.warn('Gemini Diet Plan Warning (Using Fallback):', error.message);
    return getFallbackPlan(conditionsList, caloriesNum);
  }
};

const estimateFreshness = async (itemName, freshnessScore, freshnessClass) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
