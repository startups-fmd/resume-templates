const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: function() {
      // Password is required only if not using OAuth
      return !this.googleId && !this.isOAuthUser;
    },
    minlength: 6
  },
  
  // OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  
  // Profile
  avatar: {
    type: String,
    default: null
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Subscription and usage
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pay-per-use', 'pro'],
      default: 'free'
    },
    usage: {
      coverLetters: {
        type: Number,
        default: 0
      },
      jobSearches: {
        type: Number,
        default: 0
      },
      resumeAnalyses: {
        type: Number,
        default: 0
      }
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    stripePriceId: String,
    currentPeriodEnd: Date,
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
      default: 'active'
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by Google ID
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

// Method to check if user can use a feature
userSchema.methods.canUseFeature = function(feature) {
  const limits = {
    free: {
      coverLetters: 3,
      jobSearches: 5,
      resumeAnalyses: 1
    },
    'pay-per-use': {
      coverLetters: 5,
      jobSearches: 5,
      resumeAnalyses: 1
    },
    pro: {
      coverLetters: Infinity,
      jobSearches: Infinity,
      resumeAnalyses: 10
    }
  };

  const plan = this.subscription.plan;
  const currentUsage = this.subscription.usage[feature] || 0;
  const limit = limits[plan][feature];

  return currentUsage < limit;
};

// Method to increment usage
userSchema.methods.incrementUsage = function(feature) {
  if (!this.subscription.usage[feature]) {
    this.subscription.usage[feature] = 0;
  }
  this.subscription.usage[feature]++;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
