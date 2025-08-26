const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    trim: true
  },
  analysis: {
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    overallFeedback: {
      type: String,
      required: true
    },
    sections: {
      summary: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String
      },
      experience: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String
      },
      education: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String
      },
      skills: {
        score: { type: Number, min: 0, max: 100 },
        feedback: String
      }
    },
    suggestions: [String],
    keywords: [String],
    missingKeywords: [String],
    atsOptimization: String,
    industryRecommendations: String
  },
  filePath: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  language: {
    type: String,
    enum: ['en', 'fr'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Index for efficient queries
resumeSchema.index({ userId: 1, createdAt: -1 });

// Method to get public data (without sensitive content)
resumeSchema.methods.toPublicJSON = function() {
  const resume = this.toObject();
  delete resume.content;
  delete resume.filePath;
  return resume;
};

module.exports = mongoose.model('Resume', resumeSchema);
