const passport = require('passport');
const User = require('../../../models/User');
const { generateToken, generateRefreshToken } = require('../../../middleware/auth');
require('../../../config/passport');

module.exports = async (req, res) => {
  try {
    // Handle Google OAuth callback
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect('/login?error=oauth_failed');
      }

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Redirect to frontend with tokens
      const redirectUrl = `/oauth-success?token=${token}&refreshToken=${refreshToken}`;
      res.redirect(redirectUrl);
    })(req, res);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
};