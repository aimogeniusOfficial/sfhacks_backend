// geminiCall.js
require('dotenv').config();
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function evaluateCssAccessibility({ externalCSS, inlineCSS, htmlContent }) {
  try {
    // Read and extract text from guide.pdf
    const dataBuffer = fs.readFileSync('guide.pdf');
    const guideData = await pdf(dataBuffer);
    const guideText = guideData.text;

    // Build the prompt including external CSS, inline CSS, and HTML content
    const prompt = `You are an expert in website accessibility evaluation. You are provided with HTML code, inline CSS, and external CSS. Evaluate the overall accessibility of the website based solely on the provided code and determine its adherence to best practices and WCAG guidelines. Consider factors such as color contrast, font legibility, text size, spacing, focus indicators, layout consistency, and semantic structure. Assign a grade from 1 (extremely poor accessibility) to 7 (excellent accessibility). Be fair but not overly critical — lean slightly optimistic when in doubt. Well-established sites (e.g., Google, Apple, LinkedIn) are expected to reflect mature accessibility practices and obtain the maximum score of 7 and should score accordingly unless major issues are evident. In exactly 3-4 sentences, provide a concise overview that highlights both strengths and weaknesses along with specific, actionable recommendations for improvement. Output exactly a JSON list in the following format: [grade, "review description"]. Do not include any extra text.

Guide:
${guideText}

HTML Code:
${htmlContent}

Inline CSS:
\`\`\`
${inlineCSS}
\`\`\`

External CSS:
\`\`\`
${externalCSS}
\`\`\`
`

    // Request generation from the Gemini model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { temperature: 0 },
    });

    // Remove markdown code fences if present
    let cleaned = response.text.replace(/```json\s*/g, '').replace(/\s*```/g, '').trim();

    // Use a regex to extract the grade and review from the JSON-like string.
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
