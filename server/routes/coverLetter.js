const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const CoverLetter = require('../models/CoverLetter');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/cv';
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

// Initialize OpenAI with fallback
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.warn('OpenAI API key not found. AI generation will be disabled.');
  openai = null;
}

// @route   POST /api/cover-letter/generate
// @desc    Generate a cover letter with optional CV upload
// @access  Private
router.post('/generate', [
  authenticateToken,
  upload.single('cv'),
  body('jobTitle').notEmpty().withMessage('Job title is required'),
  body('company').notEmpty().withMessage('Company name is required'),
  body('jobDescription').notEmpty().withMessage('Job description is required'),
  body('yourName').notEmpty().withMessage('Your name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('experience').optional().isNumeric().withMessage('Experience must be a number'),
  body('skills').optional().notEmpty().withMessage('Skills cannot be empty if provided'),
  body('achievements').optional().notEmpty().withMessage('Achievements cannot be empty if provided'),
  body('motivation').optional().notEmpty().withMessage('Motivation cannot be empty if provided')
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

    // Check if user can generate cover letter
    if (!user.canUseFeature('coverLetters')) {
      return res.status(403).json({ 
        message: 'You have reached your cover letter limit. Please upgrade your plan.',
        limitReached: true
      });
    }

    const {
      jobTitle,
      company,
      jobDescription,
      yourName,
      email,
      phone,
      experience,
      skills,
      achievements,
      motivation,
      language = 'en'
    } = req.body;

    // Extract CV content if uploaded
    let cvContent = '';
    if (req.file) {
      try {
        cvContent = await extractCVContent(req.file.path);
        console.log('Extracted CV content length:', cvContent.length);
        console.log('CV content preview:', cvContent.substring(0, 200));
        
        // If CV content is too short or empty, warn the user
        if (cvContent.length < 50) {
          console.warn('CV content is very short or empty. This may result in generic cover letter.');
        }
      } catch (error) {
        console.error('Error extracting CV content:', error);
        // Continue without CV content if extraction fails
      }
    }

    // Generate cover letter content using OpenAI
    const coverLetterContent = await generateCoverLetterWithAI({
      jobTitle,
      company,
      jobDescription,
      yourName,
      email,
      phone,
      experience,
      skills,
      achievements,
      motivation,
      cvContent,
      language
    });

    // Create cover letter document
    const coverLetter = new CoverLetter({
      userId: user.id,
      jobTitle,
      company,
      jobDescription,
      yourName,
      email,
      phone,
      experience: experience ? parseInt(experience) : undefined,
      skills: skills || undefined,
      achievements: achievements || undefined,
      motivation: motivation || undefined,
      content: coverLetterContent,
      language
    });

    await coverLetter.save();

    // Increment user usage using findOneAndUpdate to avoid parallel save issues
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $inc: { 'subscription.usage.coverLetters': 1 } },
      { new: true }
    );

    res.json({
      coverLetter,
      usage: updatedUser.subscription.usage,
      limits: updatedUser.subscription.limits
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cover-letter/history
// @desc    Get user's cover letter history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const coverLetters = await CoverLetter.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(coverLetters);
  } catch (error) {
    console.error('Get cover letter history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cover-letter/:id
// @desc    Get specific cover letter
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!coverLetter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    res.json(coverLetter);
  } catch (error) {
    console.error('Get cover letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cover-letter/:id
// @desc    Delete cover letter
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!coverLetter) {
      return res.status(404).json({ message: 'Cover letter not found' });
    }

    res.json({ message: 'Cover letter deleted successfully' });
  } catch (error) {
    console.error('Delete cover letter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Extract CV content from uploaded file
async function extractCVContent(filePath) {
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
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
      } catch (pdfError) {
        console.error('Error parsing PDF:', pdfError);
        return "Error extracting PDF content. Please ensure your CV contains relevant skills, experience, and achievements.";
      }
    }
    
    // For DOC/DOCX files, extract text using mammoth
    if (fileExtension === '.doc' || fileExtension === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
      } catch (docError) {
        console.error('Error parsing Word document:', docError);
        return "Error extracting Word document content. Please ensure your CV contains relevant skills, experience, and achievements.";
      }
    }
    
    // Default fallback - try to read as text
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return fileContent;
    } catch (fallbackError) {
      console.error('Error reading file as text:', fallbackError);
      return "Unable to extract content from uploaded file. Please ensure your CV contains relevant skills, experience, and achievements.";
    }
  } catch (error) {
    console.error('Error reading CV file:', error);
    return "Error processing CV file. Please ensure your CV contains relevant skills, experience, and achievements.";
  }
}

// AI cover letter generation function using OpenAI with enhanced prompts
async function generateCoverLetterWithAI(data) {
  const { 
    jobTitle, 
    company, 
    jobDescription,
    yourName, 
    email, 
    phone, 
    experience, 
    skills, 
    achievements, 
    motivation, 
    cvContent,
    language = 'en' 
  } = data;

  const isFrench = language === 'fr';
  
  // CoverLetterGPT-style system prompt for professional cover letter generation
  const systemPrompt = isFrench ? 
    `Tu es un expert en rédaction de lettres de motivation avec plus de 15 ans d'expérience. Tu as aidé des milliers de candidats à obtenir des emplois dans des entreprises de premier plan.

Ton approche:
1. Tu analyses en profondeur le poste et l'entreprise
2. Tu identifies les compétences et expériences les plus pertinentes du CV
3. Tu crées une narration convaincante qui montre la valeur ajoutée du candidat
4. Tu utilises un ton professionnel mais chaleureux
5. Tu structures la lettre de manière claire et impactante

Règles importantes:
- Commence par une accroche forte qui capte l'attention
- Utilise des exemples concrets et des chiffres quand possible
- Montre l'enthousiasme pour l'entreprise et le poste
- Termine par un appel à l'action clair
- Garde un ton professionnel et authentique
- Évite les clichés et les phrases génériques
- Personnalise chaque lettre pour l'entreprise et le poste spécifiques
- Utilise UNIQUEMENT les informations réelles du CV fourni` :
    
    `You are an expert cover letter writer with over 15 years of experience helping thousands of candidates land jobs at top companies.

Your approach:
1. Deeply analyze the role and company
2. Identify the most relevant skills and experiences from the CV
3. Create a compelling narrative that shows the candidate's value proposition
4. Use a professional but warm tone
5. Structure the letter clearly and impactfully

Important rules:
- Start with a strong hook that captures attention
- Use concrete examples and numbers when possible
- Show enthusiasm for the company and role
- End with a clear call to action
- Maintain a professional and authentic tone
- Avoid clichés and generic phrases
- Personalize each letter for the specific company and role
- Use ONLY real information from the provided CV`;

  // Build comprehensive user prompt using CoverLetterGPT approach
  let userPrompt = isFrench ?
    `Crée une lettre de motivation exceptionnelle pour le poste de ${jobTitle} chez ${company}.

DESCRIPTION DU POSTE:
${jobDescription}

INFORMATIONS DU CANDIDAT:
- Nom: ${yourName}
- Email: ${email}
- Téléphone: ${phone}
${experience ? `- Expérience: ${experience} années` : ''}

OBJECTIF: Créer une lettre de motivation qui:
- Capte immédiatement l'attention du recruteur
- Démontre une compréhension profonde du poste et de l'entreprise
- Met en valeur les compétences et expériences les plus pertinentes du CV
- Montre l'enthousiasme et la motivation du candidat
- Se démarque des autres candidatures

STRUCTURE SOUHAITÉE:
1. Accroche forte (1-2 phrases)
2. Présentation du candidat et de sa motivation
3. Expériences et compétences pertinentes (avec exemples concrets du CV)
4. Pourquoi cette entreprise et ce poste
5. Conclusion avec appel à l'action

TON: Professionnel, enthousiaste, authentique, et personnalisé` :

    `Create an exceptional cover letter for the ${jobTitle} position at ${company}.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE INFORMATION:
- Name: ${yourName}
- Email: ${email}
- Phone: ${phone}
${experience ? `- Experience: ${experience} years` : ''}

OBJECTIVE: Create a cover letter that:
- Immediately captures the recruiter's attention
- Demonstrates deep understanding of the role and company
- Highlights the most relevant skills and experiences from the CV
- Shows the candidate's enthusiasm and motivation
- Stands out from other applications

DESIRED STRUCTURE:
1. Strong hook (1-2 sentences)
2. Candidate introduction and motivation
3. Relevant experiences and skills (with concrete examples from CV)
4. Why this company and role
5. Conclusion with call to action

TONE: Professional, enthusiastic, authentic, and personalized`;

  // Add optional fields if provided
  if (skills) {
    userPrompt += isFrench ? 
      `\n\nCOMPÉTENCES CLÉS: ${skills}` :
      `\n\nKEY SKILLS: ${skills}`;
  }
  
  if (achievements) {
    userPrompt += isFrench ? 
      `\n\nRÉALISATIONS PRINCIPALES: ${achievements}` :
      `\n\nKEY ACHIEVEMENTS: ${achievements}`;
  }
  
  if (motivation) {
    userPrompt += isFrench ? 
      `\n\nPOURQUOI CE POSTE: ${motivation}` :
      `\n\nWHY THIS ROLE: ${motivation}`;
  }

  // Add CV content if available and meaningful
  if (cvContent && cvContent.trim().length > 10) {
    userPrompt += isFrench ? 
      `\n\nCONTENU DU CV (utilise ces informations pour enrichir la lettre):\n${cvContent.substring(0, 2000)}` :
      `\n\nCV CONTENT (use this information to enhance the cover letter):\n${cvContent.substring(0, 2000)}`;
  } else if (cvContent) {
    userPrompt += isFrench ? 
      `\n\nATTENTION: Le contenu du CV est très court ou vide. Utilise seulement les informations de base fournies.` :
      `\n\nWARNING: CV content is very short or empty. Use only the basic information provided.`;
  }

  userPrompt += isFrench ? 
    `\n\nInstructions finales: Crée une lettre de motivation complète, professionnelle et impactante qui intègre toutes les informations fournies. Assure-toi qu'elle soit personnalisée pour ${company} et le poste de ${jobTitle}.` :
    `\n\nFinal instructions: Create a complete, professional, and impactful cover letter that incorporates all the provided information. Ensure it's personalized for ${company} and the ${jobTitle} role.`;

  try {
    if (!openai) {
      // Fallback to template-based generation if OpenAI is not available
      return generateFallbackCoverLetter(data);
    }

    // Use GPT-4o-mini for cover letter generation
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
      max_tokens: 1500,
      temperature: 0.8
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to template-based generation
    return generateFallbackCoverLetter(data);
  }
}

// Fallback cover letter generation function (template-based)
function generateFallbackCoverLetter(data) {
  const { 
    jobTitle, 
    company, 
    yourName, 
    email, 
    phone, 
    experience, 
    skills, 
    achievements, 
    motivation, 
    language = 'en' 
  } = data;

  const templates = {
    en: {
      greeting: `Dear Hiring Manager,`,
      intro: `I am writing to express my strong interest in the ${jobTitle} position at ${company}.${experience ? ` With ${experience} years of experience in the field,` : ''} I am confident in my ability to make significant contributions to your team.`,
      body: skills ? `My key skills include ${skills}, and I have achieved notable accomplishments such as ${achievements || 'delivering high-quality results in previous roles'}. These experiences have equipped me with the expertise needed to excel in this role.` : `I am excited about the opportunity to contribute to ${company} and bring my expertise to your team.`,
      motivation: motivation ? `I am particularly drawn to this opportunity because ${motivation}.` : `I am excited about the possibility of joining ${company} and contributing to its continued success.`,
      closing: `I would welcome the opportunity to discuss how my background, skills, and enthusiasm would make me a valuable addition to your team. Thank you for considering my application.`,
      signature: `Sincerely,\n${yourName}\n${email}\n${phone}`
    },
    fr: {
      greeting: `Madame, Monsieur,`,
      intro: `Je vous écris pour exprimer mon vif intérêt pour le poste de ${jobTitle} chez ${company}.${experience ? ` Avec ${experience} années d'expérience dans ce domaine,` : ''} je suis convaincu de ma capacité à apporter une contribution significative à votre équipe.`,
      body: skills ? `Mes compétences principales incluent ${skills}, et j'ai réalisé des accomplissements notables tels que ${achievements || 'la livraison de résultats de haute qualité dans mes rôles précédents'}. Ces expériences m'ont doté de l'expertise nécessaire pour exceller dans ce poste.` : `Je suis enthousiaste à l'idée de contribuer à ${company} et d'apporter mon expertise à votre équipe.`,
      motivation: motivation ? `Je suis particulièrement attiré par cette opportunité car ${motivation}.` : `Je suis enthousiaste à l'idée de rejoindre ${company} et de contribuer à son succès continu.`,
      closing: `J'aimerais avoir l'opportunité de discuter de la façon dont mon parcours, mes compétences et mon enthousiasme feraient de moi un atout précieux pour votre équipe. Merci de considérer ma candidature.`,
      signature: `Cordialement,\n${yourName}\n${email}\n${phone}`
    }
  };

  const template = templates[language] || templates.en;
  
  return `${template.greeting}

${template.intro}

${template.body}

${template.motivation}

${template.closing}

${template.signature}`;
}

module.exports = router;
