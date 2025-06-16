const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');
const pino = require('pino');

dotenv.config();
const router = express.Router();
const logger = pino();
const JWT_SECRET = process.env.JWT_SECRET;

// ========================
// Register Route
// ========================
router.post(
  '/register',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('firstName', 'First Name is required').notEmpty(),
    body('lastName', 'Last Name is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation failed during registration', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName } = req.body;
      const db = await connectToDatabase();
      const collection = db.collection('users');

      const existingEmail = await collection.findOne({ email });
      if (existingEmail) {
        logger.error('Email already exists');
        return res.status(400).json({ error: 'Email already exists' });
      }

      const salt = await bcryptjs.genSalt(10);
      const hash = await bcryptjs.hash(password, salt);

      const result = await collection.insertOne({
        email,
        firstName,
        lastName,
        password: hash,
        createdAt: new Date(),
      });

      const payload = {
        user: { id: result.insertedId },
      };

      const authtoken = jwt.sign(payload, JWT_SECRET);
      logger.info('User registered successfully');

      res.json({ authtoken, email });
    } catch (error) {
      logger.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

// ========================
// Login Route
// ========================
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation failed during login', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const db = await connectToDatabase();
      const collection = db.collection('users');
      const user = await collection.findOne({ email });

      if (!user) {
        logger.error('User not found');
        return res.status(404).json({ error: 'User not found' });
      }

      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        logger.error('Incorrect password');
        return res.status(401).json({ error: 'Incorrect password' });
      }

      const payload = {
        user: { id: user._id.toString() },
      };

      const authtoken = jwt.sign(payload, JWT_SECRET);
      logger.info('User logged in successfully');

      res.status(200).json({ authtoken, userName: user.firstName, userEmail: user.email });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
);

// ========================
// Update Route
// ========================
router.put(
  '/update',
  [
    body('name', 'Name must be at least 2 characters long').isLength({ min: 2 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in update request', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.headers.email;
    if (!email) {
      logger.error('Email not found in request headers');
      return res.status(400).json({ error: 'Email not found in request headers' });
    }

    try {
      const db = await connectToDatabase();
      const collection = db.collection('users');
      const existingUser = await collection.findOne({ email });

      if (!existingUser) {
        logger.error('User not found for update');
        return res.status(404).json({ error: 'User not found' });
      }

      const updateData = {
        firstName: req.body.name,
        updatedAt: new Date(),
      };

      const updatedUser = await collection.findOneAndUpdate(
        { email },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!updatedUser.value) {
        return res.status(500).json({ error: 'User update failed' });
      }

      const payload = {
        user: { id: updatedUser.value._id.toString() },
      };

      const authtoken = jwt.sign(payload, JWT_SECRET);
      logger.info('User updated successfully');

      res.json({ authtoken });
    } catch (error) {
      logger.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
);

module.exports = router;
