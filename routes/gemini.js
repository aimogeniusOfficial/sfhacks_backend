var express = require('express');
var router = express.Router();
var evaluateCssAccessibility = require('../geminiCall'); // adjust path if needed

router.post('/', async (req, res) => {
  try {
    const cssContent = req.body;
    if (!cssContent) {
      return res.status(400).send("CSS content is required");
    }
    const result = await evaluateCssAccessibility(cssContent);
    res.send(result);
  } catch (error) {
    console.error("Error in /rate route:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
