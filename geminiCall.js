// geminiCall.js
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyAfxNl78GTHfml4prMlOVJNDLdMKQMhq7k" });

async function evaluateCssAccessibility(cssContent) {
  try {
    // Read and extract text from guide.pdf
    const dataBuffer = fs.readFileSync('guide.pdf');
    const guideData = await pdf(dataBuffer);
    const guideText = guideData.text;

    // Build the prompt with the guide text as context
    const prompt = `You are an expert in CSS accessibility evaluation. You are provided with CSS code, and you must assess its adherence to best practices and WCAG guidelines. Evaluate factors such as color contrast, font legibility, text size, spacing, focus indicators, and overall clarity of styling. Based solely on the provided CSS, assign a grade from 1 (extremely poor accessibility) to 7 (excellent accessibility). In exactly 3-4 sentences, provide a review that highlights both strengths and weaknesses, and offer specific, actionable recommendations for improvement. Output exactly a JSON list in the following format: [grade, "review description"]. Do not include any extra text.

Guidelines:
${guideText}

CSS Code:
\`\`\`
${cssContent}
\`\`\``;

    // Request generation from the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { temperature: 0 },
    });

    // Remove markdown code fences if present
    let cleaned = response.text.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();

    // Extract grade and review from the JSON-like string using regex
    const regex = /^\[\s*(\d+)\s*,\s*"(.*)"\s*\]$/s;
    const match = cleaned.match(regex);
    if (match) {
      const grade = match[1];
      const review = match[2];
      return {
        grade: grade,
        review: review
      };
    } else {
      // Fallback: if regex fails, return the cleaned text directly.
      return cleaned;
    }
  } catch (error) {
    console.error("Error evaluating CSS accessibility:", error);
    throw error;
  }
}

module.exports = evaluateCssAccessibility;
