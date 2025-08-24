import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const enTranslations = {
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "submit": "Submit",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "language": "Language",
    "english": "English",
    "french": "French"
  },
  "navigation": {
    "home": "Home",
    "coverLetters": "Cover Letters",
    "resumeTips": "Resume Tips",
    "jobTracker": "Job Tracker",
    "pricing": "Pricing",
    "profile": "Profile",
    "login": "Login",
    "signup": "Sign Up",
    "logout": "Logout",
    "signupRequired": "Sign up to access this feature",
    "signupFree": "It's free to get started!"
  },
  "home": {
    "hero": {
      "title": "Your Complete Job Application Assistant",
      "subtitle": "Create professional cover letters, get resume tips, and land your dream job with AI-powered assistance",
      "cta": "Get Started Free",
      "learnMore": "Learn More"
    },
    "features": {
      "coverLetters": {
        "title": "AI-Powered Cover Letters",
        "description": "Generate personalized cover letters tailored to your experience and the job requirements"
      },
      "resumeTips": {
        "title": "Resume Optimization",
        "description": "Get expert tips to make your resume stand out and pass ATS systems"
      },
      "jobSearch": {
        "title": "Job Search Tools",
        "description": "Find relevant job opportunities and track your applications"
      },
      "templates": {
        "title": "Professional Templates",
        "description": "Choose from industry-specific templates designed by HR professionals"
      }
    },
    "stats": {
      "coverLettersGenerated": "Cover Letters Generated",
      "successRate": "Success Rate",
      "professionalTemplates": "Professional Templates",
      "aiSupport": "AI Support"
    },
    "testimonials": {
      "title": "What Our Users Say",
      "subtitle": "Join thousands of satisfied users who landed their dream jobs",
      "testimonial1": {
        "name": "Sarah Johnson",
        "role": "Software Engineer",
        "company": "TechCorp",
        "content": "MotivAI helped me create a compelling cover letter that landed me my dream job. The AI suggestions were spot-on!"
      },
      "testimonial2": {
        "name": "Michael Chen",
        "role": "Marketing Manager",
        "company": "GrowthCo",
        "content": "The resume optimization tips were incredibly helpful. I passed through ATS systems and got more interviews than ever."
      },
      "testimonial3": {
        "name": "Emma Rodriguez",
        "role": "UX Designer",
        "company": "DesignStudio",
        "content": "Professional templates and AI-powered content made my job search so much easier. Highly recommended!"
      }
    },
    "cta": {
      "title": "Ready to Land Your Dream Job?",
      "subtitle": "Start creating professional cover letters and optimizing your resume today",
      "button": "Get Started Free"
    },
    "featuresSection": {
      "title": "Everything You Need to Land Your Dream Job",
      "subtitle": "From AI-powered cover letters to expert resume tips, we've got you covered every step of the way."
    }
  },
  "pricing": {
    "title": "Choose Your Plan",
    "subtitle": "Start free, upgrade when you need more",
    "getStarted": "Get Started",
    "currencySelector": "Select Currency",
    "free": {
      "title": "Free",
      "price": "$0",
      "period": "forever",
      "features": [
        "3 cover letters per month",
        "Basic resume tips",
        "5 job search queries",
        "Standard templates"
      ]
    },
    "payPerUse": {
      "title": "5 Cover Letters",
      "price": "$5",
      "period": "one-time",
      "features": [
        "5 cover letters",
        "Basic resume tips",
        "5 job search queries",
        "Standard templates",
        "No monthly commitment"
      ]
    },
    "pro": {
      "title": "Unlimited Monthly",
      "price": "$5.75",
      "period": "per month",
      "features": [
        "Unlimited cover letters",
        "Advanced resume analysis",
        "Unlimited job searches",
        "Premium templates",
        "Priority support",
        "Export to PDF"
      ],
      "popular": "Most Popular"
    }
  },
  "coverLetter": {
    "title": "Create Your Cover Letter",
    "subtitle": "Create professional cover letters tailored to your experience and job requirements",
    "usage": {
      "coverLettersUsed": "Cover Letters Used",
      "reachedLimit": "You've reached your limit. Upgrade to Pro for unlimited cover letters."
    },
    "sections": {
      "jobInformation": "Job Information",
      "yourInformation": "Your Information",
      "professionalDetails": "Professional Details"
    },
    "form": {
      "jobTitle": "Job Title",
      "company": "Company Name",
      "yourName": "Your Full Name",
      "email": "Email Address",
      "phone": "Phone Number",
      "experience": "Years of Experience",
      "skills": "Key Skills",
      "achievements": "Key Achievements",
      "motivation": "Why you want this job",
      "generate": "Generate Cover Letter",
      "regenerate": "Regenerate",
      "download": "Download PDF"
    },
    "preview": {
      "title": "Cover Letter Preview",
      "edit": "Edit Content",
      "noLetter": "No cover letter generated yet",
      "noLetterSubtitle": "Fill out the form and click \"Generate Cover Letter\" to create your personalized cover letter."
    },
    "tips": {
      "title": "Tips for a Great Cover Letter",
      "tip1": "Keep it concise and focused on your most relevant experience",
      "tip2": "Quantify your achievements with specific numbers when possible",
      "tip3": "Show enthusiasm for the company and position",
      "tip4": "Proofread carefully before sending"
    }
  },
  "jobTracker": {
    "title": "Job Application Tracker",
    "subtitle": "Track your job applications and stay organized throughout your job search",
    "usage": {
      "applicationsTracked": "Applications Tracked",
      "remaining": "remaining"
    },
    "addJob": {
      "title": "Add New Job",
      "companyPlaceholder": "Company name",
      "positionPlaceholder": "Job title/position",
      "locationPlaceholder": "Location (city, state, remote)",
      "salaryPlaceholder": "Salary range (optional)",
      "urlPlaceholder": "Job posting URL (optional)",
      "addButton": "Add Job",
      "adding": "Adding..."
    },
    "filters": {
      "title": "Filters",
      "show": "Show Filters",
      "hide": "Hide Filters",
      "clear": "Clear All",
      "status": "Application Status",
      "dateRange": "Date Range",
      "allStatuses": "All Statuses",
      "saved": "Saved",
      "applied": "Applied",
      "interview": "Interview",
      "offer": "Offer",
      "rejected": "Rejected",
      "withdrawn": "Withdrawn"
    },
    "stats": {
      "title": "Application Statistics",
      "total": "Total Applications",
      "applied": "Applied",
      "interviewing": "Interviewing",
      "offers": "Offers",
      "rejected": "Rejected",
      "responseRate": "Response Rate",
      "avgResponseTime": "Avg Response Time"
    },
    "job": {
      "status": "Status",
      "dateApplied": "Date Applied",
      "followUp": "Follow Up",
      "notes": "Notes",
      "edit": "Edit",
      "delete": "Delete"
    },
    "details": {
      "company": "Company",
      "position": "Position",
      "location": "Location",
      "salary": "Salary",
      "status": "Status",
      "dateApplied": "Date Applied",
      "url": "Job URL",
      "notes": "Notes",
      "reminders": "Reminders",
      "addReminder": "Add Reminder",
      "reminderDate": "Reminder Date",
      "reminderNote": "Reminder Note",
      "saveChanges": "Save Changes",
      "cancel": "Cancel"
    },
    "statusOptions": {
      "saved": "Saved",
      "applied": "Applied",
      "interview": "Interview",
      "offer": "Offer",
      "rejected": "Rejected",
      "withdrawn": "Withdrawn"
    },
    "errors": {
      "loginRequired": "Please log in to track your applications",
      "limitReached": "You have reached your application tracking limit. Please upgrade your plan.",
      "companyRequired": "Company name is required",
      "positionRequired": "Position is required"
    },
    "success": {
      "jobAdded": "Job added to your tracker!",
      "jobUpdated": "Job updated successfully!",
      "jobDeleted": "Job removed from tracker",
      "reminderAdded": "Reminder added successfully!"
    }
  },
  "resume": {
    "title": "Resume Tips & Analysis",
    "subtitle": "AI-powered resume optimization and expert advice",
    "analysis": {
      "title": "AI Resume Analysis",
      "uploadLabel": "Upload Resume (PDF, DOC, DOCX, TXT)",
      "contentLabel": "Or paste your resume content",
      "contentPlaceholder": "Paste your resume content here...",
      "contentHelper": "Paste your resume content directly into this text area for analysis",
      "jobDescriptionLabel": "Job Description (Optional - for targeted analysis)",
      "jobDescriptionPlaceholder": "Paste the job description to get targeted recommendations...",
      "analyzeButton": "Analyze Resume",
      "analyzing": "Analyzing...",
      "overallScore": "Overall Score",
      "improvementSuggestions": "Improvement Suggestions",
      "foundKeywords": "Found Keywords",
      "missingKeywords": "Missing Keywords",
      "atsOptimization": "ATS Optimization",
      "industryRecommendations": "Industry Recommendations",
      "analysisResults": "Analysis Results",
      "remaining": "remaining",
      "resumeAnalyses": "Resume Analyses"
    },
    "sections": {
      "summary": "Professional Summary",
      "experience": "Work Experience",
      "education": "Education",
      "skills": "Skills",
      "ats": "ATS Optimization"
    },
    "tips": {
      "title": "Expert Tips",
      "keywords": "Use relevant keywords",
      "actionVerbs": "Start with action verbs",
      "quantify": "Quantify achievements",
      "format": "Keep it clean and readable",
      "summary": {
        "concise": "Keep it concise (2-3 sentences)",
        "highlight": "Highlight your most relevant experience",
        "achievements": "Include key achievements and skills",
        "actionVerbs": "Use action verbs to start sentences",
        "tailor": "Tailor it to the specific job you're applying for"
      },
      "experience": {
        "chronological": "Use reverse chronological order",
        "include": "Include company name, job title, and dates",
        "bulletPoints": "Use bullet points for responsibilities and achievements",
        "quantify": "Quantify achievements with numbers when possible",
        "accomplishments": "Focus on accomplishments, not just duties",
        "tense": "Use present tense for current jobs, past tense for previous jobs"
      },
      "education": {
        "highestDegree": "List your highest degree first",
        "institution": "Include institution name, degree, and graduation date",
        "coursework": "Add relevant coursework if you're a recent graduate",
        "gpa": "Include GPA if it's 3.5 or higher",
        "certifications": "Add certifications and professional development"
      },
      "skills": {
        "categories": "Group skills by category (Technical, Soft Skills, etc.)",
        "hardSoft": "Include both hard and soft skills",
        "match": "Match skills to job requirements",
        "keywords": "Use keywords from the job description",
        "relevant": "Keep it relevant to your target position"
      },
      "ats": {
        "headings": "Use standard section headings",
        "keywords": "Include relevant keywords from job descriptions",
        "avoidGraphics": "Avoid graphics, tables, or complex formatting",
        "fonts": "Use standard fonts (Arial, Calibri, Times New Roman)",
        "pdf": "Save as PDF to preserve formatting",
        "fileSize": "Keep file size under 2MB"
      }
    },
    "templates": {
      "title": "Templates",
      "defaultName": "Template",
      "defaultDescription": "Professional resume template",
      "defaultCategory": "Professional",
      "useButton": "Use Template",
      "previewButton": "Preview",
      "downloadButton": "Download",
      "premiumLabel": "Premium",
      "modern": {
        "name": "Modern",
        "description": "Clean and professional design with modern typography"
      },
      "classic": {
        "name": "Classic",
        "description": "Traditional layout with timeless appeal"
      },
      "creative": {
        "name": "Creative",
        "description": "Unique design for creative industries"
      },
      "minimal": {
        "name": "Minimal",
        "description": "Simple and clean design focusing on content"
      },
      "executive": {
        "name": "Executive",
        "description": "Sophisticated design for senior positions"
      },
      "categories": {
        "professional": "Professional",
        "creative": "Creative",
        "executive": "Executive"
      }
    },
    "errors": {
      "loginRequired": "Please log in to analyze your resume",
      "limitReached": "You have reached your resume analysis limit. Please upgrade your plan.",
      "contentRequired": "Please provide resume content or upload a file",
      "fileSizeLimit": "File size must be less than 5MB",
      "invalidFileType": "Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.",
      "analysisFailed": "Analysis failed. Please try again."
    },
    "success": {
      "analysisCompleted": "Resume analysis completed!",
      "fileUploaded": "File uploaded successfully!",
      "fileRemoved": "File removed successfully!"
    }
  },
  "auth": {
    "login": {
      "title": "Welcome Back",
      "subtitle": "Sign in to your account",
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Enter your password",
      "forgotPassword": "Forgot Password?",
      "noAccount": "Don't have an account?",
      "signup": "Sign up",
      "signIn": "Sign In",
      "signingIn": "Signing in...",
      "withGoogle": "Continue with Google",
      "orContinueWith": "or continue with email"
    },
    "signup": {
      "title": "Create Account",
      "subtitle": "Join MotivAI today",
      "firstName": "First Name",
      "firstNamePlaceholder": "Enter your first name",
      "lastName": "Last Name",
      "lastNamePlaceholder": "Enter your last name",
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Create a password",
      "confirmPassword": "Confirm Password",
      "confirmPasswordPlaceholder": "Confirm your password",
      "agree": "I agree to the terms and conditions",
      "hasAccount": "Already have an account?",
      "login": "Log in",
      "createAccount": "Create Account",
      "creatingAccount": "Creating account...",
      "withGoogle": "Continue with Google",
      "orContinueWith": "or continue with email"
    },
    "validation": {
      "firstNameRequired": "First name is required",
      "firstNameMinLength": "First name must be at least 2 characters",
      "lastNameRequired": "Last name is required",
      "lastNameMinLength": "Last name must be at least 2 characters",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "passwordRequired": "Password is required",
      "passwordMinLength": "Password must be at least 6 characters",
      "confirmPasswordRequired": "Please confirm your password",
      "passwordsDoNotMatch": "Passwords do not match",
      "passwordWeak": "Weak password",
      "passwordMedium": "Medium strength password",
      "passwordStrong": "Strong password"
    },
    "loginSuccess": "Login successful!",
    "registerSuccess": "Account created successfully!",
    "logoutSuccess": "Logged out successfully!"
  },
  "profile": {
    "title": "Profile Settings",
    "personalInfo": "Personal Information",
    "subscription": "Subscription",
    "usage": "Usage Statistics",
    "settings": "Settings"
  },
  "footer": {
    "tagline": "Your complete job application assistant powered by AI.",
    "product": "Product",
    "support": "Support",
    "language": "Language",
    "helpCenter": "Help Center",
    "contactUs": "Contact Us",
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "copyright": "© 2024 MotivAI. All rights reserved."
  }
};

const frTranslations = {
  "common": {
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "submit": "Soumettre",
    "back": "Retour",
    "next": "Suivant",
    "previous": "Précédent",
    "language": "Langue",
    "english": "Anglais",
    "french": "Français"
  },
  "navigation": {
    "home": "Accueil",
    "coverLetters": "Lettres de motivation",
    "resumeTips": "Conseils CV",
    "jobTracker": "Suivi des Candidatures",
    "pricing": "Tarifs",
    "profile": "Profil",
    "login": "Connexion",
    "signup": "S'inscrire",
    "logout": "Déconnexion",
    "signupRequired": "Inscrivez-vous pour accéder à cette fonctionnalité",
    "signupFree": "C'est gratuit pour commencer !"
  },
  "home": {
    "hero": {
      "title": "Votre Assistant Complet de Candidature",
      "subtitle": "Créez des lettres de motivation professionnelles, obtenez des conseils CV et décrochez votre emploi de rêve avec l'assistance IA",
      "cta": "Commencer Gratuitement",
      "learnMore": "En Savoir Plus"
    },
    "features": {
      "coverLetters": {
        "title": "Lettres de Motivation IA",
        "description": "Générez des lettres de motivation personnalisées adaptées à votre expérience et aux exigences du poste"
      },
      "resumeTips": {
        "title": "Optimisation de CV",
        "description": "Obtenez des conseils d'experts pour faire ressortir votre CV et passer les systèmes ATS"
      },
      "jobSearch": {
        "title": "Outils de Recherche d'Emploi",
        "description": "Trouvez des opportunités d'emploi pertinentes et suivez vos candidatures"
      },
      "templates": {
        "title": "Modèles Professionnels",
        "description": "Choisissez parmi des modèles spécifiques à l'industrie conçus par des professionnels RH"
      }
    },
    "stats": {
      "coverLettersGenerated": "Lettres de Motivation Générées",
      "successRate": "Taux de Réussite",
      "professionalTemplates": "Modèles Professionnels",
      "aiSupport": "Support IA"
    },
    "testimonials": {
      "title": "Ce que Disent Nos Utilisateurs",
      "subtitle": "Rejoignez des milliers d'utilisateurs satisfaits qui ont décroché leur emploi de rêve",
      "testimonial1": {
        "name": "Sarah Johnson",
        "role": "Ingénieure Logiciel",
        "company": "TechCorp",
        "content": "MotivAI m'a aidée à créer une lettre de motivation convaincante qui m'a permis d'obtenir mon emploi de rêve. Les suggestions IA étaient parfaites !"
      },
      "testimonial2": {
        "name": "Michael Chen",
        "role": "Directeur Marketing",
        "company": "GrowthCo",
        "content": "Les conseils d'optimisation de CV ont été incroyablement utiles. J'ai passé les systèmes ATS et obtenu plus d'entretiens que jamais."
      },
      "testimonial3": {
        "name": "Emma Rodriguez",
        "role": "Designer UX",
        "company": "DesignStudio",
        "content": "Les modèles professionnels et le contenu alimenté par l'IA ont rendu ma recherche d'emploi tellement plus facile. Très recommandé !"
      }
    },
    "cta": {
      "title": "Prêt à Décrocher Votre Emploi de Rêve ?",
      "subtitle": "Commencez à créer des lettres de motivation professionnelles et à optimiser votre CV aujourd'hui",
      "button": "Commencer Gratuitement"
    },
    "featuresSection": {
      "title": "Tout Ce Dont Vous Avez Besoin pour Décrocher Votre Emploi de Rêve",
      "subtitle": "Des lettres de motivation alimentées par l'IA aux conseils d'experts CV, nous vous accompagnons à chaque étape."
    }
  },
  "pricing": {
    "title": "Choisissez Votre Plan",
    "subtitle": "Commencez gratuitement, améliorez quand vous en avez besoin",
    "getStarted": "Commencer",
    "currencySelector": "Sélectionner la Devise",
    "free": {
      "title": "Gratuit",
      "price": "0€",
      "period": "pour toujours",
      "features": [
        "3 lettres de motivation par mois",
        "Conseils CV de base",
        "5 recherches d'emploi",
        "Modèles standard"
      ]
    },
    "payPerUse": {
      "title": "5 Lettres de Motivation",
      "price": "3,25€",
      "period": "usage unique",
      "features": [
        "5 lettres de motivation",
        "Conseils CV de base",
        "5 recherches d'emploi",
        "Modèles standard",
        "Aucun engagement mensuel"
      ]
    },
    "pro": {
      "title": "Illimité Mensuel",
      "price": "5€",
      "period": "par mois",
      "features": [
        "Lettres de motivation illimitées",
        "Analyse de CV avancée",
        "Recherches d'emploi illimitées",
        "Modèles premium",
        "Support prioritaire",
        "Export PDF"
      ],
      "popular": "Le Plus Populaire"
    }
  },
  "coverLetter": {
    "title": "Créez Votre Lettre de Motivation",
    "subtitle": "Créez des lettres de motivation professionnelles adaptées à votre expérience et aux exigences du poste",
    "usage": {
      "coverLettersUsed": "Lettres de Motivation Utilisées",
      "reachedLimit": "Vous avez atteint votre limite. Passez à Pro pour des lettres de motivation illimitées."
    },
    "sections": {
      "jobInformation": "Informations sur le Poste",
      "yourInformation": "Vos Informations",
      "professionalDetails": "Détails Professionnels"
    },
    "form": {
      "jobTitle": "Titre du Poste",
      "company": "Nom de l'Entreprise",
      "yourName": "Votre Nom Complet",
      "email": "Adresse Email",
      "phone": "Numéro de Téléphone",
      "experience": "Années d'Expérience",
      "skills": "Compétences Clés",
      "achievements": "Réalisations Clés",
      "motivation": "Pourquoi vous voulez ce poste",
      "generate": "Générer la Lettre",
      "regenerate": "Régénérer",
      "download": "Télécharger PDF"
    },
    "preview": {
      "title": "Aperçu de la Lettre",
      "edit": "Modifier le Contenu",
      "noLetter": "Aucune lettre de motivation générée",
      "noLetterSubtitle": "Remplissez le formulaire et cliquez sur \"Générer la Lettre\" pour créer votre lettre de motivation personnalisée."
    },
    "tips": {
      "title": "Conseils pour une Excellente Lettre de Motivation",
      "tip1": "Gardez-la concise et concentrée sur votre expérience la plus pertinente",
      "tip2": "Quantifiez vos réalisations avec des chiffres spécifiques quand c'est possible",
      "tip3": "Montrez votre enthousiasme pour l'entreprise et le poste",
      "tip4": "Relisez attentivement avant d'envoyer"
    }
  },
  "jobTracker": {
    "title": "Suivi des Candidatures",
    "subtitle": "Suivez vos candidatures et restez organisé pendant votre recherche d'emploi",
    "usage": {
      "applicationsTracked": "Candidatures Suivies",
      "remaining": "restant"
    },
    "addJob": {
      "title": "Ajouter un Nouvel Emploi",
      "companyPlaceholder": "Nom de l'entreprise",
      "positionPlaceholder": "Titre du poste/position",
      "locationPlaceholder": "Lieu (ville, état, télétravail)",
      "salaryPlaceholder": "Fourchette de salaire (optionnel)",
      "urlPlaceholder": "URL de l'offre d'emploi (optionnel)",
      "addButton": "Ajouter l'Emploi",
      "adding": "Ajout en cours..."
    },
    "filters": {
      "title": "Filtres",
      "show": "Afficher les Filtres",
      "hide": "Masquer les Filtres",
      "clear": "Tout Effacer",
      "status": "Statut de Candidature",
      "dateRange": "Période",
      "allStatuses": "Tous les Statuts",
      "saved": "Sauvegardé",
      "applied": "Candidaté",
      "interview": "Entretien",
      "offer": "Offre",
      "rejected": "Refusé",
      "withdrawn": "Retiré"
    },
    "stats": {
      "title": "Statistiques de Candidature",
      "total": "Total des Candidatures",
      "applied": "Candidaté",
      "interviewing": "En Entretien",
      "offers": "Offres",
      "rejected": "Refusé",
      "responseRate": "Taux de Réponse",
      "avgResponseTime": "Temps de Réponse Moyen"
    },
    "job": {
      "status": "Statut",
      "dateApplied": "Date de Candidature",
      "followUp": "Suivi",
      "notes": "Notes",
      "edit": "Modifier",
      "delete": "Supprimer"
    },
    "details": {
      "company": "Entreprise",
      "position": "Poste",
      "location": "Lieu",
      "salary": "Salaire",
      "status": "Statut",
      "dateApplied": "Date de Candidature",
      "url": "URL de l'Emploi",
      "notes": "Notes",
      "reminders": "Rappels",
      "addReminder": "Ajouter un Rappel",
      "reminderDate": "Date du Rappel",
      "reminderNote": "Note du Rappel",
      "saveChanges": "Enregistrer les Modifications",
      "cancel": "Annuler"
    },
    "statusOptions": {
      "saved": "Sauvegardé",
      "applied": "Candidaté",
      "interview": "Entretien",
      "offer": "Offre",
      "rejected": "Refusé",
      "withdrawn": "Retiré"
    },
    "errors": {
      "loginRequired": "Veuillez vous connecter pour suivre vos candidatures",
      "limitReached": "Vous avez atteint votre limite de suivi de candidatures. Veuillez améliorer votre plan.",
      "companyRequired": "Le nom de l'entreprise est requis",
      "positionRequired": "Le poste est requis"
    },
    "success": {
      "jobAdded": "Emploi ajouté à votre suivi !",
      "jobUpdated": "Emploi mis à jour avec succès !",
      "jobDeleted": "Emploi retiré du suivi",
      "reminderAdded": "Rappel ajouté avec succès !"
    }
  },
  "resume": {
    "title": "Conseils CV et Analyse",
    "subtitle": "Optimisation de CV alimentée par l'IA et conseils d'experts",
    "analysis": {
      "title": "Analyse IA de CV",
      "uploadLabel": "Télécharger CV (PDF, DOC, DOCX, TXT)",
      "contentLabel": "Ou coller le contenu de votre CV",
      "contentPlaceholder": "Collez le contenu de votre CV ici...",
      "contentHelper": "Collez le contenu de votre CV directement dans cette zone de texte pour l'analyse",
      "jobDescriptionLabel": "Description du Poste (Optionnel - pour une analyse ciblée)",
      "jobDescriptionPlaceholder": "Collez la description du poste pour obtenir des recommandations ciblées...",
      "analyzeButton": "Analyser le CV",
      "analyzing": "Analyse en cours...",
      "overallScore": "Score Global",
      "improvementSuggestions": "Suggestions d'Amélioration",
      "foundKeywords": "Mots-clés Trouvés",
      "missingKeywords": "Mots-clés Manquants",
      "atsOptimization": "Optimisation ATS",
      "industryRecommendations": "Recommandations Sectorielles",
      "analysisResults": "Résultats de l'Analyse",
      "remaining": "restant",
      "resumeAnalyses": "Analyses de CV"
    },
    "sections": {
      "summary": "Résumé Professionnel",
      "experience": "Expérience Professionnelle",
      "education": "Formation",
      "skills": "Compétences",
      "ats": "Optimisation ATS"
    },
    "tips": {
      "title": "Conseils d'Experts",
      "keywords": "Utilisez des mots-clés pertinents",
      "actionVerbs": "Commencez par des verbes d'action",
      "quantify": "Quantifiez les réalisations",
      "format": "Gardez-le propre et lisible",
      "summary": {
        "concise": "Gardez-le concis (2-3 phrases)",
        "highlight": "Mettez en avant votre expérience la plus pertinente",
        "achievements": "Incluez les réalisations et compétences clés",
        "actionVerbs": "Utilisez des verbes d'action pour commencer les phrases",
        "tailor": "Adaptez-le au poste spécifique pour lequel vous postulez"
      },
      "experience": {
        "chronological": "Utilisez l'ordre chronologique inverse",
        "include": "Incluez le nom de l'entreprise, le titre du poste et les dates",
        "bulletPoints": "Utilisez des puces pour les responsabilités et réalisations",
        "quantify": "Quantifiez les réalisations avec des chiffres quand c'est possible",
        "accomplishments": "Concentrez-vous sur les accomplissements, pas seulement les tâches",
        "tense": "Utilisez le présent pour les emplois actuels, le passé pour les précédents"
      },
      "education": {
        "highestDegree": "Listez votre diplôme le plus élevé en premier",
        "institution": "Incluez le nom de l'institution, le diplôme et la date d'obtention",
        "coursework": "Ajoutez les cours pertinents si vous êtes un diplômé récent",
        "gpa": "Incluez la moyenne si elle est de 3,5 ou plus",
        "certifications": "Ajoutez les certifications et le développement professionnel"
      },
      "skills": {
        "categories": "Groupez les compétences par catégorie (Techniques, Soft Skills, etc.)",
        "hardSoft": "Incluez à la fois les compétences techniques et comportementales",
        "match": "Adaptez les compétences aux exigences du poste",
        "keywords": "Utilisez les mots-clés de la description du poste",
        "relevant": "Gardez-le pertinent pour votre poste cible"
      },
      "ats": {
        "headings": "Utilisez des en-têtes de section standard",
        "keywords": "Incluez les mots-clés pertinents des descriptions de poste",
        "avoidGraphics": "Évitez les graphiques, tableaux ou formatage complexe",
        "fonts": "Utilisez des polices standard (Arial, Calibri, Times New Roman)",
        "pdf": "Sauvegardez en PDF pour préserver le formatage",
        "fileSize": "Gardez la taille du fichier sous 2MB"
      }
    },
    "templates": {
      "title": "Modèles",
      "defaultName": "Modèle",
      "defaultDescription": "Modèle de CV professionnel",
      "defaultCategory": "Professionnel",
      "useButton": "Utiliser le Modèle",
      "previewButton": "Aperçu",
      "downloadButton": "Télécharger",
      "premiumLabel": "Premium",
      "modern": {
        "name": "Moderne",
        "description": "Design propre et professionnel avec une typographie moderne"
      },
      "classic": {
        "name": "Classique",
        "description": "Mise en page traditionnelle avec un attrait intemporel"
      },
      "creative": {
        "name": "Créatif",
        "description": "Design unique pour les industries créatives"
      },
      "minimal": {
        "name": "Minimal",
        "description": "Design simple et épuré axé sur le contenu"
      },
      "executive": {
        "name": "Exécutif",
        "description": "Design sophistiqué pour les postes de direction"
      },
      "categories": {
        "professional": "Professionnel",
        "creative": "Créatif",
        "executive": "Exécutif"
      }
    },
    "errors": {
      "loginRequired": "Veuillez vous connecter pour analyser votre CV",
      "limitReached": "Vous avez atteint votre limite d'analyse de CV. Veuillez améliorer votre plan.",
      "contentRequired": "Veuillez fournir le contenu du CV ou télécharger un fichier",
      "fileSizeLimit": "La taille du fichier doit être inférieure à 5MB",
      "invalidFileType": "Type de fichier invalide. Veuillez télécharger des fichiers PDF, DOC, DOCX ou TXT.",
      "analysisFailed": "L'analyse a échoué. Veuillez réessayer."
    },
    "success": {
      "analysisCompleted": "Analyse de CV terminée !",
      "fileUploaded": "Fichier téléchargé avec succès !",
      "fileRemoved": "Fichier supprimé avec succès !"
    }
  },
  "auth": {
    "login": {
      "title": "Bon Retour",
      "subtitle": "Connectez-vous à votre compte",
      "email": "Email",
      "emailPlaceholder": "Entrez votre email",
      "password": "Mot de Passe",
      "passwordPlaceholder": "Entrez votre mot de passe",
      "forgotPassword": "Mot de passe oublié ?",
      "noAccount": "Vous n'avez pas de compte ?",
      "signup": "S'inscrire",
      "signIn": "Se Connecter",
      "signingIn": "Connexion en cours...",
      "withGoogle": "Continuer avec Google",
      "orContinueWith": "ou continuer avec email"
    },
    "signup": {
      "title": "Créer un Compte",
      "subtitle": "Rejoignez MotivAI aujourd'hui",
      "firstName": "Prénom",
      "firstNamePlaceholder": "Entrez votre prénom",
      "lastName": "Nom",
      "lastNamePlaceholder": "Entrez votre nom",
      "email": "Email",
      "emailPlaceholder": "Entrez votre email",
      "password": "Mot de Passe",
      "passwordPlaceholder": "Créez un mot de passe",
      "confirmPassword": "Confirmer le Mot de Passe",
      "confirmPasswordPlaceholder": "Confirmez votre mot de passe",
      "agree": "J'accepte les termes et conditions",
      "hasAccount": "Vous avez déjà un compte ?",
      "login": "Se connecter",
      "createAccount": "Créer un Compte",
      "creatingAccount": "Création du compte...",
      "withGoogle": "Continuer avec Google",
      "orContinueWith": "ou continuer avec email"
    },
    "validation": {
      "firstNameRequired": "Le prénom est requis",
      "firstNameMinLength": "Le prénom doit contenir au moins 2 caractères",
      "lastNameRequired": "Le nom est requis",
      "lastNameMinLength": "Le nom doit contenir au moins 2 caractères",
      "emailRequired": "L'email est requis",
      "emailInvalid": "Veuillez entrer une adresse email valide",
      "passwordRequired": "Le mot de passe est requis",
      "passwordMinLength": "Le mot de passe doit contenir au moins 6 caractères",
      "confirmPasswordRequired": "Veuillez confirmer votre mot de passe",
      "passwordsDoNotMatch": "Les mots de passe ne correspondent pas",
      "passwordWeak": "Mot de passe faible",
      "passwordMedium": "Mot de passe de force moyenne",
      "passwordStrong": "Mot de passe fort"
    },
    "loginSuccess": "Connexion réussie !",
    "registerSuccess": "Compte créé avec succès !",
    "logoutSuccess": "Déconnexion réussie !"
  },
  "profile": {
    "title": "Paramètres du Profil",
    "personalInfo": "Informations Personnelles",
    "subscription": "Abonnement",
    "usage": "Statistiques d'Utilisation",
    "settings": "Paramètres"
  },
  "footer": {
    "tagline": "Votre assistant complet de candidature alimenté par l'IA.",
    "product": "Produit",
    "support": "Support",
    "language": "Langue",
    "helpCenter": "Centre d'Aide",
    "contactUs": "Nous Contacter",
    "privacyPolicy": "Politique de Confidentialité",
    "termsOfService": "Conditions d'Utilisation",
    "copyright": "© 2024 MotivAI. Tous droits réservés."
  }
};

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
