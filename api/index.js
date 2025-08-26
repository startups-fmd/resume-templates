const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./auth');
const coverLetterRoutes = require('./coverLetter');
const resumeRoutes = require('./resume');
const jobTrackerRoutes = require('./jobTracker');
const subscriptionRoutes = require('./subscription');
const userRoutes = require('./user');
const stripeRoutes = require('./stripe');

// Initialize passport
require('./config/passport');

// Connect to database
const connectDB = require('./config/database');

const app = express();

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel URL
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/auth', authRoutes);
app.use('/cover-letter', coverLetterRoutes);
app.use('/resume', resumeRoutes);
app.use('/job-tracker', jobTrackerRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/user', userRoutes);
app.use('/stripe', stripeRoutes);

// 404 handler
app.use('*', (req, res) => {
  console.log('Route not found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Connect to database
    await connectDB();
    
    // Handle the request
    return app(req, res);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
};
