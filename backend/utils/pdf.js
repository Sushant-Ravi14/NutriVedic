const PDFDocument = require('pdfkit');
const { uploadBuffer } = require('./cloudinary');
const stream = require('stream');

const generateDietPlanPDF = async (dietPlan, userProfile) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        const result = Buffer.concat(chunks);
        try {
          const uploadResult = await uploadBuffer(result, 'diet_plans_pdf');
          resolve(uploadResult.secure_url);
        } catch (err) {
          reject(err);
        }
      });

      // Simple PDF content generation
      doc.fontSize(25).text('NutriVedic Diet Plan', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text(`Condition: ${dietPlan.condition}`);
      doc.fontSize(16).text(`Target Calories: ${dietPlan.targetKcal} kcal/day`);
      doc.moveDown();

      dietPlan.plan.forEach(dayPlan => {
        doc.fontSize(18).text(`Day ${dayPlan.day}`, { underline: true });
        doc.fontSize(14).text(`Breakfast: ${dayPlan.breakfast.name} (${dayPlan.breakfast.calories} kcal)`);
        doc.fontSize(14).text(`Lunch: ${dayPlan.lunch.name} (${dayPlan.lunch.calories} kcal)`);
        doc.fontSize(14).text(`Snack: ${dayPlan.snack.name} (${dayPlan.snack.calories} kcal)`);
        doc.fontSize(14).text(`Dinner: ${dayPlan.dinner.name} (${dayPlan.dinner.calories} kcal)`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateDietPlanPDF };
