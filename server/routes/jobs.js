const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Mock job data - this will be replaced with real API integration later
const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    type: 'Full-time',
    postedDate: '2 days ago',
    description: 'We are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing and maintaining our core platform, working with cutting-edge technologies, and mentoring junior developers.',
    requirements: ['5+ years experience', 'React/Node.js', 'AWS', 'Agile methodology'],
    benefits: ['Health insurance', '401k matching', 'Remote work', 'Flexible hours'],
    isRemote: true,
    logo: null
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'DesignStudio',
    location: 'New York, NY',
    salary: '$90,000 - $110,000',
    type: 'Full-time',
    postedDate: '1 week ago',
    description: 'Join our creative team as a Frontend Developer. You will work on beautiful, responsive web applications and collaborate with designers to create amazing user experiences.',
    requirements: ['3+ years experience', 'JavaScript/TypeScript', 'React/Vue', 'CSS/SCSS'],
    benefits: ['Competitive salary', 'Professional development', 'Team events'],
    isRemote: false,
    logo: null
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Austin, TX',
    salary: '$100,000 - $130,000',
    type: 'Full-time',
    postedDate: '3 days ago',
    description: 'Help us build and maintain our cloud infrastructure. You will work with modern DevOps tools and practices to ensure our systems are scalable, secure, and reliable.',
    requirements: ['4+ years experience', 'Docker/Kubernetes', 'AWS/GCP', 'CI/CD'],
    benefits: ['Remote work', 'Health benefits', 'Stock options', 'Learning budget'],
    isRemote: true,
    logo: null
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'InnovateCo',
    location: 'Seattle, WA',
    salary: '$130,000 - $160,000',
    type: 'Full-time',
    postedDate: '5 days ago',
    description: 'Lead product strategy and development for our flagship product. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
    requirements: ['5+ years PM experience', 'Agile/Scrum', 'Data analysis', 'User research'],
    benefits: ['Competitive salary', 'Health insurance', '401k', 'Flexible PTO'],
    isRemote: false,
    logo: null
  },
  {
    id: '5',
    title: 'UX Designer',
    company: 'CreativeAgency',
    location: 'Los Angeles, CA',
    salary: '$80,000 - $100,000',
    type: 'Full-time',
    postedDate: '1 day ago',
    description: 'Create amazing user experiences for our clients. You will conduct user research, create wireframes and prototypes, and collaborate with developers to bring designs to life.',
    requirements: ['3+ years UX experience', 'Figma/Sketch', 'User research', 'Prototyping'],
    benefits: ['Creative environment', 'Health benefits', 'Professional tools', 'Conference budget'],
    isRemote: true,
    logo: null
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Boston, MA',
    salary: '$110,000 - $140,000',
    type: 'Full-time',
    postedDate: '4 days ago',
    description: 'Join our data science team to build machine learning models and extract insights from large datasets. You will work on cutting-edge AI projects that drive business decisions.',
    requirements: ['4+ years experience', 'Python/R', 'Machine Learning', 'SQL', 'Statistics'],
    benefits: ['Competitive salary', 'Health benefits', '401k', 'Professional development'],
    isRemote: true,
    logo: null
  },
  {
    id: '7',
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Miami, FL',
    salary: '$85,000 - $105,000',
    type: 'Full-time',
    postedDate: '6 days ago',
    description: 'Develop native mobile applications for iOS and Android. You will work on user-facing features and collaborate with cross-functional teams to deliver high-quality apps.',
    requirements: ['3+ years experience', 'Swift/Kotlin', 'React Native', 'Mobile development'],
    benefits: ['Health insurance', '401k', 'Flexible hours', 'Remote work options'],
    isRemote: false,
    logo: null
  },
  {
    id: '8',
    title: 'Backend Engineer',
    company: 'ServerTech',
    location: 'Denver, CO',
    salary: '$95,000 - $125,000',
    type: 'Full-time',
    postedDate: '1 week ago',
    description: 'Build scalable backend services and APIs. You will work with modern technologies to create robust, high-performance systems that serve millions of users.',
    requirements: ['4+ years experience', 'Java/Python/Go', 'Microservices', 'Databases'],
    benefits: ['Competitive salary', 'Health benefits', '401k', 'Stock options'],
    isRemote: true,
    logo: null
  }
];

// @route   GET /api/jobs/search
// @desc    Search for jobs
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, location, jobType, experience, salary, remote } = req.query;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter jobs based on search criteria
    let filteredJobs = mockJobs;
    
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery) ||
        job.company.toLowerCase().includes(searchQuery) ||
        job.description.toLowerCase().includes(searchQuery)
      );
    }
    
    if (location) {
      const locationQuery = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationQuery)
      );
    }
    
    if (jobType && jobType !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.type === jobType);
    }
    
    if (remote && remote !== 'all') {
      const isRemote = remote === 'remote';
      filteredJobs = filteredJobs.filter(job => job.isRemote === isRemote);
    }
    
    // Update usage for the user
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { jobSearches: 1 }
    });
    
    res.json({
      jobs: filteredJobs,
      total: filteredJobs.length,
      message: 'Job search completed successfully'
    });
    
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ message: 'Server error during job search' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job details by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const job = mockJobs.find(j => j.id === req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
    
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs/save
// @desc    Save a job to user's list
// @access  Private
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Here you would typically save to user's saved jobs in database
    // For now, we'll just return success
    
    res.json({ 
      message: 'Job saved successfully',
      jobId 
    });
    
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/save/:jobId
// @desc    Remove a job from user's saved list
// @access  Private
router.delete('/save/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Here you would typically remove from user's saved jobs in database
    // For now, we'll just return success
    
    res.json({ 
      message: 'Job removed from saved list',
      jobId 
    });
    
  } catch (error) {
    console.error('Remove saved job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
