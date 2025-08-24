const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user && user.isActive) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Debug: Log the profile data to see what Google provides
    console.log('Google profile data:', {
      id: profile.id,
      displayName: profile.displayName,
      name: profile.name,
      emails: profile.emails,
      photos: profile.photos
    });

    // Check if user already exists
    let user = await User.findByGoogleId(profile.id);

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findByEmail(profile.emails[0].value);
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.isOAuthUser = true;
      user.isEmailVerified = true; // Google emails are verified
      user.avatar = profile.photos[0]?.value;
      user.lastLogin = new Date();
      await user.save();
      return done(null, user);
    }

    // Create new user with better name handling
    let firstName = 'User';
    let lastName = 'User';
    
    if (profile.name && profile.name.givenName) {
      firstName = profile.name.givenName;
    }
    
    if (profile.name && profile.name.familyName) {
      lastName = profile.name.familyName;
    } else if (profile.displayName) {
      // If no family name, try to extract from display name
      const nameParts = profile.displayName.split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = profile.displayName;
      }
    }
    
    user = new User({
      googleId: profile.id,
      firstName: firstName,
      lastName: lastName,
      email: profile.emails[0].value,
      isOAuthUser: true,
      isEmailVerified: true, // Google emails are verified
      avatar: profile.photos[0]?.value,
      lastLogin: new Date()
    });

    await user.save();
    return done(null, user);

  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
