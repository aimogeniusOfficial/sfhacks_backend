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
    accessibilityCatalogueCollection = client.db(process.env.MONGO_DB_NAME).collection('accessibility_catalogue');
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
    let result;
    result = await accessibilityCatalogueCollection.findOne({ url: req.body.url });
    if (!result) {
        const css = await getCSS(req.body.url);
        const cssAccessibility = await evaluateCssAccessibility(css.external[0].content);
        grade = cssAccessibility.grade;
        review = cssAccessibility.review;
        result = await accessibilityCatalogueCollection.insertOne({
            url: req.body.url,
            badge_level: grade,
            improvement_suggestions: review,
            created_at: Date.now(),
            updated_at: Date.now()
        });
    }
    res.status(200).json(result);
});

module.exports = router;
