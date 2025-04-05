require('dotenv').config();
var express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

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

module.exports = router;
