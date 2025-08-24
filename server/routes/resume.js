const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');
const OpenAI = require('openai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Initialize OpenAI
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.warn('OpenAI API key not found. AI analysis will be disabled.');
  openai = null;
}

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/resume/tips
// @desc    Get resume optimization tips
// @access  Private
router.get('/tips', authenticateToken, async (req, res) => {
  try {
    const tips = {
      summary: {
        titleKey: 'resume.sections.summary',
        tips: [
          'resume.tips.summary.concise',
          'resume.tips.summary.highlight',
          'resume.tips.summary.achievements',
          'resume.tips.summary.actionVerbs',
          'resume.tips.summary.tailor'
        ]
      },
      experience: {
        titleKey: 'resume.sections.experience',
        tips: [
          'resume.tips.experience.chronological',
          'resume.tips.experience.include',
          'resume.tips.experience.bulletPoints',
          'resume.tips.experience.quantify',
          'resume.tips.experience.accomplishments',
          'resume.tips.experience.tense'
        ]
      },
      education: {
        titleKey: 'resume.sections.education',
        tips: [
          'resume.tips.education.highestDegree',
          'resume.tips.education.institution',
          'resume.tips.education.coursework',
          'resume.tips.education.gpa',
          'resume.tips.education.certifications'
        ]
      },
      skills: {
        titleKey: 'resume.sections.skills',
        tips: [
          'resume.tips.skills.categories',
          'resume.tips.skills.hardSoft',
          'resume.tips.skills.match',
          'resume.tips.skills.keywords',
          'resume.tips.skills.relevant'
        ]
      },
      ats: {
        titleKey: 'resume.sections.ats',
        tips: [
          'resume.tips.ats.headings',
          'resume.tips.ats.keywords',
          'resume.tips.ats.avoidGraphics',
          'resume.tips.ats.fonts',
          'resume.tips.ats.pdf',
          'resume.tips.ats.fileSize'
        ]
      }
    };

    res.json(tips);
  } catch (error) {
    console.error('Get resume tips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resume/analyze
// @desc    Analyze resume content with AI
// @access  Private
router.post('/analyze', [
  authenticateToken,
  upload.single('resume'),
  body('content').optional().notEmpty().withMessage('Resume content is required if no file uploaded'),
  body('jobDescription').optional().notEmpty().withMessage('Job description is optional but recommended for better analysis')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can analyze resume
    if (!user.canUseFeature('resumeAnalyses')) {
      return res.status(403).json({ 
        message: 'You have reached your resume analysis limit. Please upgrade your plan.',
        limitReached: true
      });
    }

    const { content, jobDescription } = req.body;
    let resumeContent = content;

    // Extract content from uploaded file if provided
    if (req.file) {
      try {
        resumeContent = await extractResumeContent(req.file.path);
        console.log('Extracted resume content length:', resumeContent.length);
      } catch (error) {
        console.error('Error extracting resume content:', error);
        return res.status(400).json({ message: 'Error processing uploaded resume file' });
      }
    }

    if (!resumeContent) {
      return res.status(400).json({ message: 'Resume content is required' });
    }

    // Perform AI-powered analysis
    const analysis = await analyzeResumeWithAI(resumeContent, jobDescription);

    // Save resume analysis to database
    const resume = new Resume({
      userId: user.id,
      title: `Resume Analysis - ${new Date().toLocaleDateString()}`,
      content: resumeContent,
      jobDescription: jobDescription || '',
      analysis: analysis,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
      fileSize: req.file ? req.file.size : null,
      language: 'en' // Default to English for now
    });

    await resume.save();

    // Increment user usage
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $inc: { 'subscription.usage.resumeAnalyses': 1 } },
      { new: true }
    );

    res.json({
      analysis,
      resumeId: resume._id,
      usage: updatedUser.subscription.usage,
      limits: updatedUser.subscription.limits
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resume/templates
// @desc    Get resume templates
// @access  Private
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'modern',
        nameKey: 'resume.templates.modern.name',
        descriptionKey: 'resume.templates.modern.description',
        categoryKey: 'resume.templates.categories.professional',
        isPremium: false,
        previewUrl: '/api/resume/templates/modern/preview'
      },
      {
        id: 'classic',
        nameKey: 'resume.templates.classic.name',
        descriptionKey: 'resume.templates.classic.description',
        categoryKey: 'resume.templates.categories.professional',
        isPremium: false,
        previewUrl: '/api/resume/templates/classic/preview'
      },
      {
        id: 'creative',
        nameKey: 'resume.templates.creative.name',
        descriptionKey: 'resume.templates.creative.description',
        categoryKey: 'resume.templates.categories.creative',
        isPremium: true,
        previewUrl: '/api/resume/templates/creative/preview'
      },
      {
        id: 'minimal',
        nameKey: 'resume.templates.minimal.name',
        descriptionKey: 'resume.templates.minimal.description',
        categoryKey: 'resume.templates.categories.professional',
        isPremium: false,
        previewUrl: '/api/resume/templates/minimal/preview'
      },
      {
        id: 'executive',
        nameKey: 'resume.templates.executive.name',
        descriptionKey: 'resume.templates.executive.description',
        categoryKey: 'resume.templates.categories.executive',
        isPremium: true,
        previewUrl: '/api/resume/templates/executive/preview'
      }
    ];

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resume/templates/:id/download
// @desc    Download resume template
// @access  Private
router.post('/templates/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if template is premium and user has access
    const premiumTemplates = ['creative', 'executive'];
    if (premiumTemplates.includes(id) && user.subscription.plan === 'free') {
      return res.status(403).json({ 
        message: 'This template requires a premium subscription',
        requiresUpgrade: true
      });
    }

    // Generate template content based on ID
    const templateContent = generateTemplateContent(id);
    
    // Create a temporary file
    const fileName = `resume-template-${id}-${Date.now()}.txt`;
    const filePath = path.join(__dirname, '../temp', fileName);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, templateContent);
    
    // Set response headers for download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Send file and clean up
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending template file:', err);
      }
      // Clean up temporary file
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temporary file:', unlinkErr);
        }
      });
    });

  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resume/templates/:id/preview
// @desc    Get template preview content
// @access  Private
router.get('/templates/:id/preview', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if template is premium and user has access
    const premiumTemplates = ['creative', 'executive'];
    if (premiumTemplates.includes(id) && user.subscription.plan === 'free') {
      return res.status(403).json({ 
        message: 'This template requires a premium subscription',
        requiresUpgrade: true
      });
    }

    const templateContent = generateTemplateContent(id);
    res.json({ 
      content: templateContent,
      templateId: id
    });

  } catch (error) {
    console.error('Get template preview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resume/history
// @desc    Get user's resume analysis history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-content -filePath') // Exclude sensitive data
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(resumes);
  } catch (error) {
    console.error('Get resume history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resume/:id
// @desc    Get specific resume analysis
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume analysis not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/resume/:id
// @desc    Delete resume analysis
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume analysis not found' });
    }

    // Delete file if it exists
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    res.json({ message: 'Resume analysis deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Extract resume content from uploaded file
async function extractResumeContent(filePath) {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    
    // For text files, read directly
    if (fileExtension === '.txt') {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return fileContent;
    }
    
    // For PDF files, extract text using pdf-parse
    if (fileExtension === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } catch (pdfError) {
        console.error('Error parsing PDF:', pdfError);
        throw new Error('Error extracting PDF content');
      }
    }
    
    // For DOC/DOCX files, extract text using mammoth
    if (fileExtension === '.doc' || fileExtension === '.docx') {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } catch (docError) {
        console.error('Error parsing Word document:', docError);
        throw new Error('Error extracting Word document content');
      }
    }
    
    // Default fallback - try to read as text
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return fileContent;
    } catch (fallbackError) {
      console.error('Error reading file as text:', fallbackError);
      throw new Error('Unable to extract content from uploaded file');
    }
  } catch (error) {
    console.error('Error reading resume file:', error);
    throw error;
  }
}

// AI-powered resume analysis function
async function analyzeResumeWithAI(resumeContent, jobDescription = '') {
  try {
    if (!openai) {
      // Fallback to basic analysis if OpenAI is not available
      return analyzeResumeBasic(resumeContent, jobDescription);
    }

    const systemPrompt = `You are an expert resume analyst with 15+ years of experience in HR and recruitment. Your task is to analyze resumes and provide detailed, actionable feedback.

Your analysis should include:
1. Overall score (0-100) with detailed reasoning
2. Section-by-section analysis (summary, experience, education, skills)
3. Specific improvement suggestions
4. Keyword analysis and ATS optimization
5. Industry-specific recommendations

Be constructive, specific, and actionable in your feedback.`;

    const userPrompt = `Please analyze this resume and provide comprehensive feedback:

RESUME CONTENT:
${resumeContent.substring(0, 3000)}

${jobDescription ? `JOB DESCRIPTION (for targeted analysis):
${jobDescription.substring(0, 1000)}` : ''}

Please provide your analysis in the following JSON format:
{
  "overallScore": 85,
  "overallFeedback": "Detailed feedback about the resume",
  "sections": {
    "summary": {"score": 80, "feedback": "Section-specific feedback"},
    "experience": {"score": 85, "feedback": "Section-specific feedback"},
    "education": {"score": 90, "feedback": "Section-specific feedback"},
    "skills": {"score": 75, "feedback": "Section-specific feedback"}
  },
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "keywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "atsOptimization": "ATS optimization feedback",
  "industryRecommendations": "Industry-specific advice"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const analysisText = completion.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      const analysis = JSON.parse(analysisText);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError);
      // Fallback to basic analysis
      return analyzeResumeBasic(resumeContent, jobDescription);
    }

  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to basic analysis
    return analyzeResumeBasic(resumeContent, jobDescription);
  }
}

// Basic resume analysis function (fallback)
function analyzeResumeBasic(content, jobDescription) {
  const words = content.toLowerCase().split(/\s+/);
  const commonKeywords = ['leadership', 'management', 'project', 'team', 'development', 'analysis', 'strategy', 'communication', 'planning', 'implementation'];
  const foundKeywords = commonKeywords.filter(keyword => words.some(word => word.includes(keyword)));
  
  return {
    overallScore: 75,
    overallFeedback: "This is a basic analysis. For detailed AI-powered feedback, ensure your OpenAI API key is configured.",
    sections: {
      summary: { score: 70, feedback: 'Summary section detected. Consider making it more specific and achievement-focused.' },
      experience: { score: 80, feedback: 'Experience section found. Focus on quantifiable achievements and results.' },
      education: { score: 85, feedback: 'Education section is present and well-structured.' },
      skills: { score: 65, feedback: 'Skills section could be enhanced with more specific technical and soft skills.' }
    },
    suggestions: [
      'Add quantifiable achievements to experience section',
      'Include more specific skills relevant to your target role',
      'Enhance the professional summary with key accomplishments',
      'Ensure consistent formatting throughout the resume'
    ],
    keywords: foundKeywords,
    missingKeywords: ['data analysis', 'agile methodology', 'stakeholder management'],
    atsOptimization: 'Ensure your resume uses standard section headings and includes relevant keywords from job descriptions.',
    industryRecommendations: 'Consider industry-specific terminology and requirements for your target role.'
  };
}

// Generate template content based on template ID
function generateTemplateContent(templateId) {
  const templates = {
    modern: `SARAH JOHNSON
Senior Software Engineer | sarah.johnson@email.com | (555) 123-4567
linkedin.com/in/sarahjohnson | San Francisco, CA

PROFESSIONAL SUMMARY
-------------------
Results-driven Senior Software Engineer with 7+ years of experience building scalable web applications and leading engineering teams. Specialized in React, Node.js, and cloud technologies with a proven track record of delivering projects that improve user engagement by 40% and reduce system downtime by 60%. Passionate about clean code, agile methodologies, and mentoring junior developers.

TECHNICAL SKILLS
----------------
Frontend: React, TypeScript, Next.js, Tailwind CSS, Redux, Jest, Storybook
Backend: Node.js, Python, Express.js, Django, REST APIs, GraphQL, WebSockets
Database: PostgreSQL, MongoDB, Redis, Elasticsearch, DynamoDB
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, GitHub Actions, Terraform
Tools: Git, VS Code, Postman, Figma, Jira, Slack, Datadog

PROFESSIONAL EXPERIENCE
----------------------

SENIOR SOFTWARE ENGINEER | TechCorp Inc. | San Francisco, CA
January 2022 - Present
• Led development of microservices architecture serving 2M+ users, resulting in 40% improvement in application performance and 60% reduction in system downtime
• Mentored 3 junior developers and established coding standards that improved code review efficiency by 35%
• Implemented automated testing pipeline that increased test coverage from 65% to 90% and reduced bug reports by 50%
• Collaborated with product managers to define technical requirements and delivered 15+ features ahead of schedule
• Designed and implemented real-time notification system using WebSockets, improving user engagement by 25%

SOFTWARE ENGINEER | StartupXYZ | San Francisco, CA
March 2020 - December 2021
• Developed and maintained React-based dashboard used by 500K+ users, improving user engagement by 25%
• Built RESTful APIs using Node.js and Express, handling 10K+ requests per minute with 99.9% uptime
• Optimized database queries and implemented caching strategies, reducing page load times by 45%
• Participated in agile development cycles, delivering 8 major features and 50+ bug fixes
• Implemented comprehensive error tracking and monitoring using Sentry and Datadog

JUNIOR DEVELOPER | WebSolutions | San Francisco, CA
June 2019 - February 2020
• Contributed to full-stack development using React, Node.js, and PostgreSQL
• Implemented responsive design principles, improving mobile user experience by 30%
• Collaborated with UX designers to create intuitive user interfaces
• Participated in code reviews and maintained 95% code quality score
• Developed reusable component library used across 5+ projects

EDUCATION
---------
BACHELOR OF SCIENCE IN COMPUTER SCIENCE | Stanford University | 2019
• GPA: 3.8/4.0 | Dean's List: 2017-2019 | Magna Cum Laude
• Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems, Machine Learning
• Senior Project: Developed a real-time collaboration platform used by 100+ students

CERTIFICATIONS
--------------
• AWS Certified Solutions Architect Associate | Amazon Web Services | 2023
• Google Cloud Professional Developer | Google | 2022
• Certified Scrum Master (CSM) | Scrum Alliance | 2021
• MongoDB Certified Developer | MongoDB | 2020

PROJECTS & ACHIEVEMENTS
---------------------
• Open Source Contributor: Contributed to 10+ popular GitHub repositories with 2000+ stars
• Hackathon Winner: 1st place at TechCrunch Disrupt 2021 for AI-powered productivity app
• Technical Blog: Published 30+ articles on Medium with 100K+ total views
• Community Speaker: Presented at 5 local tech meetups on React best practices
• GitHub: 500+ contributions, 50+ repositories, 1000+ followers

LANGUAGES
---------
English (Native), Spanish (Conversational), French (Basic)`,

    classic: `MICHAEL CHEN
123 Main Street, Apt 4B
New York, NY 10001
(555) 987-6543 | michael.chen@email.com

OBJECTIVE
---------
Experienced Marketing Manager seeking a senior role in digital marketing where I can leverage my expertise in data-driven campaigns, team leadership, and brand strategy to drive measurable business growth and customer engagement.

EDUCATION
---------
BACHELOR OF BUSINESS ADMINISTRATION IN MARKETING
New York University, New York, NY
Graduated: May 2018 | GPA: 3.7/4.0
• Honors: Dean's List (2016-2018), Marketing Department Award
• Relevant Coursework: Digital Marketing, Consumer Behavior, Marketing Analytics, Brand Management, Business Statistics
• Senior Thesis: "The Impact of Social Media on Consumer Purchase Decisions"

EXPERIENCE
----------
SENIOR MARKETING MANAGER | GrowthCo Inc. | New York, NY
March 2021 - Present
• Lead digital marketing campaigns across multiple channels, resulting in 150% increase in lead generation and 45% improvement in conversion rates
• Manage team of 5 marketing specialists and coordinate with sales, product, and design teams to ensure campaign alignment
• Develop and execute comprehensive marketing strategies for 3 product lines, contributing to 30% revenue growth
• Implement marketing automation tools and analytics platforms, improving campaign ROI by 60%
• Oversee $500K annual marketing budget and achieve 25% cost reduction while maintaining performance

MARKETING MANAGER | BrandSolutions | New York, NY
June 2019 - February 2021
• Managed social media presence for 10+ clients, increasing average engagement rates by 40%
• Developed and executed email marketing campaigns that generated $2M in revenue
• Created content marketing strategies that improved organic traffic by 80%
• Collaborated with creative teams to produce high-converting marketing materials
• Analyzed campaign performance data and provided actionable insights to stakeholders

MARKETING COORDINATOR | StartupXYZ | New York, NY
July 2018 - May 2019
• Assisted in planning and executing marketing campaigns across digital and traditional channels
• Managed social media accounts and created engaging content that increased followers by 200%
• Coordinated with external agencies and vendors to ensure timely campaign delivery
• Conducted market research and competitive analysis to inform marketing strategies
• Supported event planning and trade show participation

SKILLS
------
Digital Marketing: Google Ads, Facebook Ads, LinkedIn Ads, SEO, SEM, Email Marketing
Analytics & Tools: Google Analytics, HubSpot, Salesforce, Tableau, Hootsuite, Mailchimp
Content Creation: Copywriting, Graphic Design, Video Production, Social Media Management
Strategy & Planning: Brand Development, Market Research, Campaign Planning, Budget Management
Soft Skills: Team Leadership, Project Management, Client Relations, Data Analysis

ACTIVITIES & INTERESTS
---------------------
• Marketing Mentor: Volunteer mentor for junior marketers through local professional organizations
• Industry Speaker: Presented at 3 marketing conferences on digital transformation trends
• Professional Development: Active member of American Marketing Association and Digital Marketing Institute
• Community Involvement: Board member of local business networking group`,

    creative: `EMMA RODRIGUEZ
UX/UI Designer & Creative Director | emma.rodriguez@email.com | (555) 456-7890
portfolio.emmarodriguez.com | Los Angeles, CA

ABOUT ME
--------
Passionate UX/UI designer with a unique blend of artistic vision and user-centered thinking. I transform complex problems into elegant, intuitive solutions that users love. My work spans from mobile apps used by millions to award-winning brand experiences. I believe great design should be both beautiful and functional, creating meaningful connections between people and technology.

CORE COMPETENCIES
-----------------
🎨 Visual Design & Branding    💡 User Experience Design    🚀 Creative Leadership
🎯 Prototyping & Wireframing   💡 Design Systems & Strategy  🚀 Cross-functional Collaboration
🎨 Illustration & Animation    💡 User Research & Testing    🚀 Design Thinking Workshops

CREATIVE JOURNEY
----------------

SENIOR UX/UI DESIGNER | DesignStudio | Los Angeles, CA
January 2021 - Present
✨ Led redesign of flagship mobile app, resulting in 50% increase in user engagement and 4.8-star App Store rating
✨ Established comprehensive design system used across 10+ products, improving design consistency by 80%
✨ Conducted user research with 200+ participants, uncovering key insights that informed product strategy
✨ Mentored 3 junior designers and facilitated design thinking workshops for cross-functional teams
✨ Collaborated with engineering teams to ensure pixel-perfect implementation of complex interactions

UX DESIGNER | TechStartup | San Francisco, CA
March 2019 - December 2020
✨ Designed end-to-end user experience for B2B SaaS platform serving 50K+ users
✨ Created interactive prototypes that helped secure $5M in funding
✨ Implemented user testing protocols that improved conversion rates by 35%
✨ Developed brand identity and visual language for company rebrand
✨ Designed responsive web applications with focus on accessibility and performance

JUNIOR DESIGNER | CreativeAgency | Los Angeles, CA
June 2018 - February 2019
✨ Contributed to design projects for Fortune 500 clients including Nike and Coca-Cola
✨ Created social media campaigns that generated 2M+ impressions
✨ Assisted in user research and usability testing for e-commerce platforms
✨ Developed illustration style guide used across multiple client projects

EDUCATION & TRAINING
-------------------
BACHELOR OF FINE ARTS IN GRAPHIC DESIGN | ArtCenter College of Design | 2018
• GPA: 3.9/4.0 | Magna Cum Laude | Outstanding Graduate Award
• Relevant Coursework: User Experience Design, Typography, Color Theory, Digital Media, Brand Identity
• Senior Project: "Accessible Design for the Digital Age" - Awarded Best in Show

CERTIFICATIONS
--------------
• Google UX Design Professional Certificate | Google | 2022
• Nielsen Norman Group UX Certification | NN/g | 2021
• Adobe Creative Suite Certified Expert | Adobe | 2020

PORTFOLIO HIGHLIGHTS
-------------------
• Mobile App Redesign: Redesigned banking app used by 2M+ users, improving task completion by 60%
• E-commerce Platform: Designed complete user experience for fashion retailer, increasing sales by 40%
• Brand Identity: Created visual identity for tech startup that won Best Brand Design at SXSW 2022
• Design System: Built comprehensive design system adopted by 5+ companies in the industry

TECHNICAL TOOLKIT
----------------
Design Software: Figma, Adobe Creative Suite, Sketch, Framer, Principle
Prototyping: InVision, Marvel, ProtoPie, Axure RP
Research & Analytics: UserTesting, Hotjar, Google Analytics, Mixpanel
Collaboration: Notion, Slack, Miro, Zeplin, Abstract`,

    minimal: `DAVID KIM
Data Scientist | david.kim@email.com | (555) 789-0123
Seattle, WA

SUMMARY
-------
Data Scientist with 4+ years of experience in machine learning, statistical analysis, and data engineering. Specialized in developing predictive models and data-driven solutions that drive business decisions and improve operational efficiency.

EXPERIENCE
----------
SENIOR DATA SCIENTIST | DataCorp | Seattle, WA | 2021-Present
Built machine learning models that improved customer retention by 25% and reduced churn prediction accuracy by 15%. Led data engineering initiatives that processed 10TB+ of data daily.

DATA SCIENTIST | TechStartup | Seattle, WA | 2019-2021
Developed recommendation systems that increased user engagement by 40%. Created automated reporting dashboards used by 50+ stakeholders.

DATA ANALYST | AnalyticsInc | Seattle, WA | 2018-2019
Performed statistical analysis on customer behavior data, identifying key insights that drove 20% increase in conversion rates.

EDUCATION
---------
MS in Data Science | University of Washington | 2018
BS in Statistics | University of Washington | 2016

SKILLS
------
Python • R • SQL • TensorFlow • PyTorch • AWS • Docker • Git • Tableau • Spark`,

    executive: `JENNIFER ANDERSON
Chief Executive Officer | jennifer.anderson@email.com | (555) 321-6540
linkedin.com/in/jenniferanderson | New York, NY

EXECUTIVE SUMMARY
-----------------
Visionary CEO with 15+ years of executive leadership experience driving transformative growth and market expansion. Successfully led 3 companies through rapid scaling phases, achieving 300% revenue growth and 500% team expansion. Proven track record of building high-performing teams, establishing strategic partnerships, and delivering exceptional shareholder value through innovative business strategies and operational excellence.

CORE LEADERSHIP COMPETENCIES
---------------------------
Strategic Planning & Execution | P&L Management | Team Leadership
Change Management | Stakeholder Relations | Business Development
Risk Management | Operational Excellence | Market Expansion

EXECUTIVE EXPERIENCE
-------------------

CHIEF EXECUTIVE OFFICER | GrowthTech Inc. | New York, NY
January 2020 - Present
• Led company through Series A to Series C funding rounds, raising $150M and achieving $500M valuation
• Orchestrated strategic pivot from B2C to B2B SaaS model, resulting in 400% revenue growth and 60% profit margin improvement
• Built and led executive team of 12 C-level leaders managing 500+ employees across 5 countries
• Established strategic partnerships with Fortune 500 companies, generating $50M in annual recurring revenue
• Successfully navigated company through COVID-19 crisis, maintaining 95% customer retention and 25% growth

CHIEF OPERATING OFFICER | TechStartup | San Francisco, CA
March 2017 - December 2019
• Transformed struggling startup into profitable enterprise, achieving $100M ARR and 80% gross margins
• Implemented operational excellence initiatives that reduced costs by 40% while improving customer satisfaction scores by 35%
• Led international expansion into 3 new markets, establishing operations in Europe and Asia
• Managed $75M annual budget and delivered 150% ROI on strategic investments
• Built scalable processes and systems supporting 300% team growth

VICE PRESIDENT OF OPERATIONS | EnterpriseCorp | Boston, MA
June 2014 - February 2017
• Led operations for $2B business unit with 1,000+ employees across 15 locations
• Implemented lean manufacturing principles, reducing operational costs by 25% and improving efficiency by 40%
• Managed $200M annual budget and delivered 120% of financial targets consistently
• Established strategic supplier relationships that improved quality metrics by 30% and reduced lead times by 50%

EDUCATION & CERTIFICATIONS
-------------------------
MASTER OF BUSINESS ADMINISTRATION | Harvard Business School | 2014
BACHELOR OF SCIENCE IN ENGINEERING | MIT | 2012
• Executive Leadership Program | Stanford Graduate School of Business | 2022
• Board Governance Certification | National Association of Corporate Directors | 2021

BOARD EXPERIENCE & ADVISORY ROLES
--------------------------------
• Board Member | Tech Innovation Council | 2021-Present
• Advisory Board Member | Startup Accelerator Inc. | 2020-Present
• Board Observer | Emerging Tech Fund | 2019-Present
• Industry Advisor | Digital Transformation Institute | 2018-Present

KEY ACHIEVEMENTS & RECOGNITION
-----------------------------
• Fortune 40 Under 40 | Fortune Magazine | 2023
• Ernst & Young Entrepreneur of the Year | EY | 2022
• Top 100 Women in Tech | TechCrunch | 2021
• Successful exit of previous company for $200M | 2019
• Featured speaker at 15+ industry conferences including SXSW, TechCrunch Disrupt, and World Economic Forum`
  };

  return templates[templateId] || templates.modern;
}

module.exports = router;
