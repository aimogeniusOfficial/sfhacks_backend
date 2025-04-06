require('dotenv').config();
var express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const getCSS = require('./get-css');
const evaluateCssAccessibility = require('../geminiCall');
var router = express.Router();
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let accessibilityCatalogueCollection;

(async () => {
  await client.connect();
  accessibilityCatalogueCollection = client
    .db(process.env.MONGO_DB_NAME)
    .collection('accessibility_catalogue');
  console.log('Connected to MongoDB');
})();

router.post('/create', async (req, res) => {
  const result = await accessibilityCatalogueCollection.insertOne(req.body);
  res.status(201).json(result);
});

router.get('/', async (req, res) => {
  const result = await accessibilityCatalogueCollection.find({}).toArray();
  res.status(200).json(result);
});

router.get('/:url', async (req, res) => {
  const result = await accessibilityCatalogueCollection.findOne({ url: req.params.url });
  res.status(200).json(result);
});

router.post("/get_or_create", async (req, res) => {
  try {
    let result = await accessibilityCatalogueCollection.findOne({ url: req.body.url });
    if (result) {
      return res.status(200).json(result);
    }
    
    // Fetch the CSS and HTML data from the provided URL.
    const cssData = await getCSS(req.body.url);
    // Use the first external CSS file's content, if available.
    const externalCSS = (cssData.external && cssData.external.length > 0) ? cssData.external[0].content : "";
    const inlineCSS = cssData.inline ? cssData.inline.join("\n") : "";
    const htmlContent = cssData.html || "";

    // Evaluate the overall accessibility using external CSS, inline CSS, and HTML content.
    const cssAccessibility = await evaluateCssAccessibility({
      externalCSS,
      inlineCSS,
      htmlContent
    });

    // Expect cssAccessibility to be an object with { grade, review }
    const { grade, review } = typeof cssAccessibility === 'object'
      ? cssAccessibility
      : { grade: "N/A", review: cssAccessibility };

    // Insert the new document into the catalogue.
    result = await accessibilityCatalogueCollection.insertOne({
      url: req.body.url,
      badge_level: grade,
      improvement_suggestions: review,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    
    res.status(200).json({
      url: req.body.url,
      badge_level: grade,
      improvement_suggestions: review,
      created_at: Date.now(),
      updated_at: Date.now()
    });
  } catch (error) {
    console.error("Error in /get_or_create route:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = router;
