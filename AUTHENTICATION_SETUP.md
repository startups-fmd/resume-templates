# 🔐 Authentication Setup Guide

## Overview

MotivAI now includes a comprehensive authentication system with:
- **Email/Password Authentication** with secure password hashing
- **Google OAuth 2.0** integration
- **JWT Token Management** with refresh tokens
- **Email Verification** (ready for implementation)
- **Password Reset** functionality (ready for implementation)

## 🚀 Quick Start

### 1. Environment Variables Setup

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/motivai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Client URL
CLIENT_URL=http://localhost:3000

# External APIs (for future use)
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

### 2. Google OAuth Setup

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

#### Step 2: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

#### Step 3: Update Environment Variables
Replace the Google OAuth variables in your `.env` file:
```env
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

### 3. Database Setup

Make sure MongoDB is running locally or update the `MONGODB_URI` to point to your MongoDB instance.

### 4. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 5. Start the Application

```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 3000).

## 🔧 Features

### Authentication Features

#### Email/Password Authentication
- ✅ Secure password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ JWT token generation and validation
- ✅ Refresh token support
- ✅ Account status management

#### Google OAuth
- ✅ Google OAuth 2.0 integration
- ✅ Automatic account linking
- ✅ Profile data synchronization
- ✅ Avatar support

#### Security Features
- ✅ JWT token expiration (7 days)
- ✅ Refresh token expiration (30 days)
- ✅ Password strength validation
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers

#### User Management
- ✅ User registration and login
- ✅ Email verification (ready)
- ✅ Password reset (ready)
- ✅ Account deactivation
- ✅ Profile management

### API Endpoints

#### Authentication Endpoints
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login user
POST /api/auth/logout            - Logout user
POST /api/auth/refresh           - Refresh access token
GET  /api/auth/me                - Get current user
GET  /api/auth/google            - Initiate Google OAuth
GET  /api/auth/google/callback   - Google OAuth callback
POST /api/auth/forgot-password   - Send password reset email
POST /api/auth/reset-password    - Reset password with token
POST /api/auth/verify-email      - Verify email with token
```

#### Protected Endpoints
```
GET  /api/cover-letter/*         - Cover letter features
GET  /api/resume/*              - Resume features
GET  /api/job-search/*          - Job search features
GET  /api/subscription/*        - Subscription management
```

## 🎨 Frontend Features

### Authentication UI
- ✅ Modern, responsive login/signup forms
- ✅ Google OAuth button integration
- ✅ Password strength indicator
- ✅ Form validation with error messages
- ✅ Loading states and animations
- ✅ Toast notifications

### User Experience
- ✅ Protected routes with automatic redirects
- ✅ User menu with profile and logout
- ✅ Authentication-aware navigation
- ✅ OAuth callback handling
- ✅ Persistent authentication state

### Internationalization
- ✅ Full bilingual support (English/French)
- ✅ Authentication messages translated
- ✅ Form validation messages translated

## 🔒 Security Considerations

### Production Deployment
1. **Change all secret keys** in the `.env` file
2. **Use HTTPS** in production
3. **Set up proper CORS** origins
4. **Configure rate limiting** appropriately
5. **Set up email service** for verification and password reset
6. **Use environment-specific** Google OAuth credentials

### Security Best Practices
- ✅ Passwords are hashed with bcrypt (salt rounds: 12)
- ✅ JWT tokens have reasonable expiration times
- ✅ Refresh tokens are used for better security
- ✅ Input validation on all endpoints
- ✅ Rate limiting to prevent abuse
- ✅ CORS protection
- ✅ Security headers with Helmet

## 🚀 Next Steps

### Email Service Integration
To enable email verification and password reset:

1. **Set up SMTP service** (Gmail, SendGrid, etc.)
2. **Update environment variables** with SMTP credentials
3. **Uncomment email service calls** in auth routes
4. **Create email templates** for verification and reset

### Additional OAuth Providers
To add more OAuth providers (GitHub, LinkedIn, etc.):

1. **Install additional Passport strategies**
2. **Add provider configuration** to passport.js
3. **Create provider-specific routes**
4. **Update frontend** with new provider buttons

### Advanced Features
- **Two-factor authentication** (2FA)
- **Social login linking** (connect multiple providers)
- **Account deletion** with data cleanup
- **Session management** dashboard
- **Login history** tracking

## 🐛 Troubleshooting

### Common Issues

#### Google OAuth Not Working
- Check that Google OAuth credentials are correct
- Verify redirect URI matches exactly
- Ensure Google+ API is enabled
- Check browser console for errors

#### JWT Token Issues
- Verify JWT_SECRET is set correctly
- Check token expiration times
- Ensure proper Authorization header format

#### Database Connection Issues
- Verify MongoDB is running
- Check MONGODB_URI format
- Ensure database permissions

#### CORS Issues
- Check CORS configuration in server.js
- Verify CLIENT_URL is set correctly
- Ensure credentials are included in requests

### Debug Mode
Enable debug mode by setting:
```env
NODE_ENV=development
```

This will show detailed error messages and enable i18next debug mode.

## 📚 API Documentation

For detailed API documentation, see the individual route files in `server/routes/`.

## 🤝 Contributing

When adding new authentication features:
1. Follow the existing code patterns
2. Add proper validation and error handling
3. Include translations for new messages
4. Update this documentation
5. Test thoroughly with both authentication methods
