const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');

// Get all applications for a user
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can use the feature
    if (!user.canUseFeature('jobSearches')) {
      return res.status(403).json({
        message: 'You have reached your application tracking limit. Please upgrade your plan.',
        limitReached: true
      });
    }

    // For now, return mock data. In a real implementation, you'd have a separate JobApplication model
    const mockApplications = [
      {
        id: '1',
        company: 'Google',
        position: 'Software Engineer',
        location: 'Mountain View, CA',
        salary: '$120,000 - $180,000',
        url: 'https://careers.google.com/jobs/123',
        status: 'applied',
        dateApplied: '2024-01-15',
        notes: 'Applied through LinkedIn. Hiring manager is John Smith.',
        reminders: [],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        company: 'Microsoft',
        position: 'Frontend Developer',
        location: 'Seattle, WA',
        salary: '$100,000 - $150,000',
        url: 'https://careers.microsoft.com/jobs/456',
        status: 'interview',
        dateApplied: '2024-01-10',
        notes: 'First interview scheduled for next week.',
        reminders: [
          {
            id: '1',
            date: '2024-01-20',
            note: 'Follow up after interview',
            completed: false
          }
        ],
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-12T09:15:00Z'
      },
      {
        id: '3',
        company: 'Apple',
        position: 'iOS Developer',
        location: 'Cupertino, CA',
        salary: '$130,000 - $200,000',
        url: 'https://jobs.apple.com/jobs/789',
        status: 'saved',
        dateApplied: null,
        notes: 'Interesting position, need to research more about the team.',
        reminders: [],
        createdAt: '2024-01-08T16:45:00Z',
        updatedAt: '2024-01-08T16:45:00Z'
      }
    ];

    res.json({
      applications: mockApplications,
      usage: user.subscription.usage,
      limits: user.subscription.limits
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new application
router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can use the feature
    if (!user.canUseFeature('jobSearches')) {
      return res.status(403).json({
        message: 'You have reached your application tracking limit. Please upgrade your plan.',
        limitReached: true
      });
    }

    const { company, position, location, salary, url, status, notes } = req.body;

    // Validate required fields
    if (!company || !position) {
      return res.status(400).json({ 
        message: 'Company and position are required' 
      });
    }

    // Create new application (mock implementation)
    const newApplication = {
      id: Date.now().toString(),
      company,
      position,
      location: location || '',
      salary: salary || '',
      url: url || '',
      status: status || 'saved',
      dateApplied: status === 'applied' ? new Date().toISOString().split('T')[0] : null,
      notes: notes || '',
      reminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Increment usage
    user.incrementUsage('jobSearches');
    await user.save();

    res.status(201).json(newApplication);

  } catch (error) {
    console.error('Error adding application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an application
router.put('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id } = req.params;
    const updates = req.body;

    // Mock implementation - in real app, you'd update the database
    const updatedApplication = {
      id,
      company: updates.company || 'Updated Company',
      position: updates.position || 'Updated Position',
      location: updates.location || '',
      salary: updates.salary || '',
      url: updates.url || '',
      status: updates.status || 'saved',
      dateApplied: updates.dateApplied || null,
      notes: updates.notes || '',
      reminders: updates.reminders || [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    res.json(updatedApplication);

  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an application
router.delete('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id } = req.params;

    // Mock implementation - in real app, you'd delete from database
    // For now, just return success

    res.json({ message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a reminder to an application
router.post('/applications/:id/reminders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { id } = req.params;
    const { date, note } = req.body;

    if (!date || !note) {
      return res.status(400).json({ 
        message: 'Date and note are required' 
      });
    }

    // Mock implementation
    const reminder = {
      id: Date.now().toString(),
      date,
      note,
      completed: false
    };

    res.status(201).json(reminder);

  } catch (error) {
    console.error('Error adding reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get application statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mock statistics
    const stats = {
      total: 15,
      applied: 8,
      interviewing: 3,
      offers: 1,
      rejected: 2,
      responseRate: 80.0,
      avgResponseTime: 3.2
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
