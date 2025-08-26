module.exports = (req, res) => {
  // Simple Google OAuth redirect
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline`;
  
  res.redirect(googleAuthUrl);
};