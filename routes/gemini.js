var express = require('express');
var router = express.Router();
const { GoogleGenAI } = require('@google/genai');

// Middleware to parse plain text bodies (CSS content)
var bodyParser = require('body-parser');
router.use(bodyParser.text({ type: 'text/plain' }));

const ai = new GoogleGenAI({ apiKey: "AIzaSyAfxNl78GTHfml4prMlOVJNDLdMKQMhq7k" });

/* POST Gemini evaluation of CSS accessibility. */
router.post('/', async (req, res) => {
  try {
    const cssContent = req.body;

    // Build the prompt for evaluating the CSS code for accessibility
    const prompt = `You are an expert in CSS accessibility. Evaluate the following CSS code for accessibility (considering font choices, color contrast, and readability). Provide a grade out of 7 and a review of potential improvements in exactly 3-4 sentences. Output exactly a JSON list in the following format: [grade, "review description"]. Do not include any extra text.

CSS Code:
\`\`\`
${cssContent}
\`\`\``;

    // Request generation from Gemini model
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
