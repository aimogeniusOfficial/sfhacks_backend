var express = require('express');
var router = express.Router();
var evaluateCssAccessibility = require('../geminiCall'); // adjust path if needed
var getCSS = require('./get-css'); // if you already have getCSS to fetch HTML & CSS

// Example: using getCSS to fetch external, inline, and HTML content from a provided URL
// (Assuming req.body.url is provided; adjust as necessary)
router.post('/', async (req, res) => {
  try {
    // Option 1: If you want to evaluate using a URL that returns HTML and CSS:
    // const cssData = await getCSS(req.body.url);
    // const externalCSS = cssData.external.length > 0 ? cssData.external[0].content : "";
    // const inlineCSS = cssData.inline.join("\n");
    // const htmlContent = cssData.html;
    
    // Option 2: If you're directly sending CSS content from the client,
    // you can create a simple object. For demonstration, we'll assume:
    const externalCSS = req.body.external || "";  // sent by client
    const inlineCSS = req.body.inline || "";        // sent by client
    const htmlContent = req.body.html || "";          // sent by client

    // Validate at least one source is provided
    if (!externalCSS && !inlineCSS && !htmlContent) {
      return res.status(400).send("At least one of external, inline, or HTML content is required");
    }

    const result = await evaluateCssAccessibility({ externalCSS, inlineCSS, htmlContent });
    res.send(result);
  } catch (error) {
    console.error("Error in /rate route:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
