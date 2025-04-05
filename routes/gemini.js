var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
var bodyParser = require('body-parser');
router.use(bodyParser.text({ type: 'text/plain' }));

const ai = new GoogleGenAI({ apiKey: "AIzaSyAfxNl78GTHfml4prMlOVJNDLdMKQMhq7k" });

/* POST Gemini evaluation of CSS accessibility.
   This version reads guide.pdf from the root directory and adds its text as context.
*/
router.post('/', async (req, res) => {
  try {
    // Read and extract text from guide.pdf
    const dataBuffer = fs.readFileSync('guide.pdf');
    const guideData = await pdf(dataBuffer);
    const guideText = guideData.text;

    const cssContent = req.body;

    // Build the prompt that includes the extracted guide text as context
    const prompt = `You are an expert in CSS accessibility. Evaluate the following CSS code for accessibility in light of the guidelines provided below. Provide a grade out of 7 and a review of potential improvements in exactly 3-4 sentences. Output exactly a JSON list in the following format: [grade, "review description"]. Do not include any extra text.

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
    });

    // Attempt to parse the response text as JSON
    try {
      const output = JSON.parse(response.text);
      res.json(output);
    } catch (parseError) {
      // If parsing fails, return the raw response text
      res.send(response.text);
    }
  } catch (error) {
    console.error("Error in /rate endpoint:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
