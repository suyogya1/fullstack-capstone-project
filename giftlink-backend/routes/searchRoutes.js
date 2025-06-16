const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('gifts');

    // Initialize the query object
    const query = {};

    // Search by name (partial match, case-insensitive)
    if (req.query.name?.trim()) {
      query.name = { $regex: req.query.name.trim(), $options: 'i' };
    }

    // Filter by category
    if (req.query.category?.trim()) {
      query.category = req.query.category.trim();
    }

    // Filter by condition
    if (req.query.condition?.trim()) {
      query.condition = req.query.condition.trim();
    }

    // Filter by maximum age (in years)
    if (req.query.age_years && !isNaN(req.query.age_years)) {
      query.age_years = { $lte: parseInt(req.query.age_years, 10) };
    }

    const gifts = await collection.find(query).toArray();
    res.json(gifts);
  } catch (e) {
    console.error('Search failed:', e);
    next(e);
  }
});

module.exports = router;
