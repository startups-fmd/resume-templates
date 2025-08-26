const mongoose = require('mongoose');

const CoverLetterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true,
    trim: true
  },
  yourName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: false
  },
  skills: {
    type: String,
    required: false,
    trim: true
  },
  achievements: {
    type: String,
    required: false,
    trim: true
  },
  motivation: {
    type: String,
    required: false,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'fr'],
    default: 'en'
  },
  template: {
    type: String,
    default: 'standard'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CoverLetterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
CoverLetterSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CoverLetter', CoverLetterSchema);
