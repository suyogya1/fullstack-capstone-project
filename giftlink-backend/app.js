/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const pinoLogger = require('./logger');
const connectToDatabase = require('./models/db');

const app = express();

// ✅ Use the dynamic port required by IBM Code Engine
const port = process.env.PORT || 8080;

// ✅ Middleware
app.use(cors());                      // Enable CORS
app.use(express.json());             // Parse JSON bodies
app.use(pinoHttp({ logger: pinoLogger })); // Logging middleware

// ✅ Connect to MongoDB
connectToDatabase()
  .then(() => {
    pinoLogger.info('Connected to MongoDB');
  })
  .catch((error) => {
    pinoLogger.error({ msg: 'MongoDB connection failed', error });
    process.exit(1); // Exit on failure
  });

// ✅ Import Routes
const giftRoutes = require('./routes/giftRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

// ✅ Mount Routes
app.use('/api/gifts', giftRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🎁 GiftLink API is running!');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  pinoLogger.error({ msg: 'Unhandled error', error: err });
  res.status(500).send('Internal Server Error');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
