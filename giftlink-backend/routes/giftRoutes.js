const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Get all gifts
router.get('/', async (req, res, next) => {
    logger.info('GET /gifts called');
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");
        const gifts = await collection.find({}).toArray();
        res.json(gifts);
    } catch (e) {
        logger.error('Error fetching gifts:', e);
        next(e);
    }
});

// Get a single gift by Mongo _id
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        const gift = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (!gift) {
            return res.status(404).send("Gift not found");
        }

        res.json(gift);
    } catch (e) {
        logger.error('Error fetching gift by ID:', e);
        next(e);
    }
});

// Add a new gift
router.post('/', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("gifts");

        const result = await collection.insertOne(req.body);

        const insertedGift = await collection.findOne({ _id: result.insertedId });
        res.status(201).json(insertedGift);
    } catch (e) {
        logger.error('Error adding gift:', e);
        next(e);
    }
});

module.exports = router;
