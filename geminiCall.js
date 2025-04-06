// geminiCall.js
const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: "AIzaSyAfxNl78GTHfml4prMlOVJNDLdMKQMhq7k" });

async function evaluateCssAccessibility({ externalCSS, inlineCSS, htmlContent }) {
  try {
    // Read and extract text from guide.pdf
    const dataBuffer = fs.readFileSync('guide.pdf');
    const guideData = await pdf(dataBuffer);
    const guideText = guideData.text;

    // Build the prompt including external CSS, inline CSS, and HTML content
    const prompt = `You are an expert in website accessibility evaluation. You are provided with HTML code, inline CSS, and external CSS. Evaluate the overall accessibility of the website based solely on the provided code and determine its adherence to best practices and WCAG guidelines. Consider factors such as color contrast, font legibility, text size, spacing, focus indicators, layout consistency, and semantic structure. Assign a grade from 1 (extremely poor accessibility) to 7 (excellent accessibility). Be somewhat generous, do not be too critical in grade. If you think its a big company like Amazon or something website, most likely it is good accessibility. In exactly 3-4 sentences, provide a detailed review that highlights both strengths and weaknesses along with specific, actionable recommendations for improvement. Output exactly a JSON list in the following format: [grade, "review description"]. Do not include any extra text.

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
`;

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
