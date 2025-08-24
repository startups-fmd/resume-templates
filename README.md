# Job Application Assistant

A comprehensive web application for job seekers featuring AI-powered cover letter generation, resume optimization tips, job search tools, and more. Available in both English and French with a freemium subscription model.

## Features

### 🎯 Core Features
- **AI-Powered Cover Letters**: Generate personalized cover letters tailored to your experience and job requirements
- **Resume Optimization**: Get expert tips to make your resume stand out and pass ATS systems
- **Job Search Tools**: Find relevant job opportunities and track your applications
- **Professional Templates**: Choose from industry-specific templates designed by HR professionals

### 🌍 Internationalization
- **Bilingual Support**: Full English and French language support
- **Language Switching**: Seamless language switching throughout the application
- **Localized Content**: All features and content available in both languages

### 💰 Subscription Model
- **Free Tier**: 3 cover letters/month, basic resume tips, 5 job searches
- **Pro Plan ($9.99/month)**: Unlimited cover letters, advanced resume analysis, unlimited job searches
- **Enterprise Plan ($29.99/month)**: Team collaboration, custom branding, API access

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hook Form** for form handling
- **React i18next** for internationalization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-application-assistant
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   nano server/.env
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   mongod
   ```

5. **Run the development servers**
   ```bash
   npm run dev
   ```

This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/job-assistant

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# AI Service Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
```

## Project Structure

```
job-application-assistant/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── i18n/          # Internationalization
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cover Letters
- `POST /api/cover-letter/generate` - Generate cover letter
- `GET /api/cover-letter/history` - Get user's cover letters
- `GET /api/cover-letter/:id` - Get specific cover letter
- `DELETE /api/cover-letter/:id` - Delete cover letter

### Resume
- `GET /api/resume/tips` - Get resume optimization tips
- `POST /api/resume/analyze` - Analyze resume content
- `GET /api/resume/templates` - Get resume templates

### Job Search
- `GET /api/job-search` - Search for jobs
- `GET /api/job-search/suggestions` - Get job suggestions
- `GET /api/job-search/trending` - Get trending searches

### Subscription
- `GET /api/subscription/usage` - Get usage statistics
- `POST /api/subscription/upgrade` - Upgrade plan
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/plans` - Get available plans

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/preferences` - Update preferences
- `DELETE /api/user/account` - Delete account
- `GET /api/user/stats` - Get user statistics

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build the frontend for production

### Frontend (client/)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend (server/)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Deployment

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `build` folder to your hosting service (Netlify, Vercel, etc.)

### Backend Deployment
1. Set up your production environment variables
2. Deploy to your hosting service (Heroku, DigitalOcean, AWS, etc.)
3. Ensure MongoDB is properly configured

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@jobassistant.com or create an issue in the repository.

## Roadmap

- [ ] Integration with real AI services (OpenAI, Claude)
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Integration with job boards (LinkedIn, Indeed)
- [ ] Resume parsing and analysis
- [ ] Interview preparation tools
