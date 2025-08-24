import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { 
  Plus, 
  Filter,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  Target,
  CheckCircle,
  Clock,
  X,
  ExternalLink,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  salary?: string;
  url?: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  dateApplied?: string;
  notes?: string;
  reminders?: Reminder[];
  createdAt: string;
  updatedAt: string;
}

interface Reminder {
  id: string;
  date: string;
  note: string;
  completed: boolean;
}

const JobTracker: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { usage, currentPlan } = useSubscription();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    url: '',
    status: 'saved' as JobApplication['status'],
    notes: ''
  });

  const limits = currentPlan?.limits || { coverLetters: 0, jobSearches: 0, resumeAnalyses: 0 };
  const remainingApplications = limits.jobSearches - usage.jobSearches;

  const filterApplications = useCallback(() => {
    let filtered = applications;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }
    
    setFilteredApplications(filtered);
  }, [applications, selectedStatus]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  // Load applications on mount
  useEffect(() => {
    const loadApplications = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch('/api/job-tracker/applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    };

    loadApplications();
  }, [isAuthenticated]);

  const handleAddApplication = async () => {
    if (!isAuthenticated) {
      toast.error(t('jobTracker.errors.loginRequired'));
      return;
    }

    if (remainingApplications <= 0) {
      toast.error(t('jobTracker.errors.limitReached'));
      return;
    }

    if (!formData.company.trim() || !formData.position.trim()) {
      toast.error(t('jobTracker.errors.companyRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/job-tracker/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add application');
      }

      const newApplication = await response.json();
      setApplications(prev => [...prev, newApplication]);
      setFormData({
        company: '',
        position: '',
        location: '',
        salary: '',
        url: '',
        status: 'saved',
        notes: ''
      });
      setShowAddForm(false);
      toast.success(t('jobTracker.success.jobAdded'));
    } catch (error) {
      console.error('Error adding application:', error);
      toast.error('Failed to add application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (id: string, updates: Partial<JobApplication>) => {
    try {
      const response = await fetch(`/api/job-tracker/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      const updatedApplication = await response.json();
      setApplications(prev => 
        prev.map(app => app.id === id ? updatedApplication : app)
      );
      setSelectedApplication(updatedApplication);
      toast.success(t('jobTracker.success.jobUpdated'));
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application. Please try again.');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`/api/job-tracker/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(prev => prev.filter(app => app.id !== id));
      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
      toast.success(t('jobTracker.success.jobDeleted'));
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application. Please try again.');
    }
  };

  const getStatusColor = (status: JobApplication['status']) => {
    const colors = {
      saved: 'bg-gray-100 text-gray-800',
      applied: 'bg-blue-100 text-blue-800',
      interview: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-600'
    };
    return colors[status];
  };

  const getStats = () => {
    const total = applications.length;
    const applied = applications.filter(app => app.status === 'applied').length;
    const interviewing = applications.filter(app => app.status === 'interview').length;
    const offers = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const responseRate = total > 0 ? ((applied + interviewing + offers) / total * 100).toFixed(1) : '0';

    return { total, applied, interviewing, offers, rejected, responseRate };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('jobTracker.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('jobTracker.subtitle')}
          </p>
        </motion.div>

        {/* Usage Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {t('jobTracker.usage.applicationsTracked')}: {usage.jobSearches}/{limits.jobSearches}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {remainingApplications} {t('jobTracker.usage.remaining')}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('jobTracker.stats.total')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('jobTracker.stats.applied')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.applied}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('jobTracker.stats.interviewing')}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.interviewing}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('jobTracker.stats.offers')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.offers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('jobTracker.stats.responseRate')}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.responseRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Add Job Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={remainingApplications <= 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('jobTracker.addJob.title')}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? t('jobTracker.filters.hide') : t('jobTracker.filters.show')}</span>
            </button>
          </div>
        </div>

        {/* Add Job Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{t('jobTracker.addJob.title')}</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.company')} *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={t('jobTracker.addJob.companyPlaceholder')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.position')} *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder={t('jobTracker.addJob.positionPlaceholder')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.location')}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('jobTracker.addJob.locationPlaceholder')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.salary')}
                  </label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder={t('jobTracker.addJob.salaryPlaceholder')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.url')}
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder={t('jobTracker.addJob.urlPlaceholder')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.details.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as JobApplication['status'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(t('jobTracker.statusOptions', { returnObjects: true })).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('jobTracker.details.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this application..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t('jobTracker.details.cancel')}
                </button>
                <button
                  onClick={handleAddApplication}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? t('jobTracker.addJob.adding') : t('jobTracker.addJob.addButton')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-8"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('jobTracker.filters.status')}
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('jobTracker.filters.allStatuses')}</option>
                    {Object.entries(t('jobTracker.statusOptions', { returnObjects: true })).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Applications List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('jobTracker.stats.title')} ({filteredApplications.length})
              </h2>
            </div>

            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.position}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {t(`jobTracker.statusOptions.${application.status}`)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{application.company}</span>
                        </div>
                        {application.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{application.location}</span>
                          </div>
                        )}
                        {application.salary && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{application.salary}</span>
                          </div>
                        )}
                      </div>

                      {application.dateApplied && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{t('jobTracker.job.dateApplied')}: {new Date(application.dateApplied).toLocaleDateString()}</span>
                        </div>
                      )}

                      {application.notes && (
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                          {application.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {application.reminders && application.reminders.length > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Bell className="w-3 h-3" />
                              <span>{application.reminders.length} {t('jobTracker.details.reminders')}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplication(application);
                            }}
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteApplication(application.id);
                            }}
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-500">
                  Start tracking your job applications by adding your first one.
                </p>
              </div>
            )}
          </div>

          {/* Application Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedApplication ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedApplication.position}</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.company')}</h4>
                    <p className="text-gray-700">{selectedApplication.company}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.position')}</h4>
                    <p className="text-gray-700">{selectedApplication.position}</p>
                  </div>

                  {selectedApplication.location && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.location')}</h4>
                      <p className="text-gray-700">{selectedApplication.location}</p>
                    </div>
                  )}

                  {selectedApplication.salary && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.salary')}</h4>
                      <p className="text-gray-700">{selectedApplication.salary}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.status')}</h4>
                    <select
                      value={selectedApplication.status}
                      onChange={(e) => handleUpdateApplication(selectedApplication.id, { status: e.target.value as JobApplication['status'] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(t('jobTracker.statusOptions', { returnObjects: true })).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  {selectedApplication.dateApplied && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.dateApplied')}</h4>
                      <p className="text-gray-700">{new Date(selectedApplication.dateApplied).toLocaleDateString()}</p>
                    </div>
                  )}

                  {selectedApplication.url && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.url')}</h4>
                      <a
                        href={selectedApplication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                      >
                        <span>View Job Posting</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t('jobTracker.details.notes')}</h4>
                    <textarea
                      value={selectedApplication.notes || ''}
                      onChange={(e) => handleUpdateApplication(selectedApplication.id, { notes: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add notes about this application..."
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteApplication(selectedApplication.id)}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
                    >
                      {t('jobTracker.job.delete')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Application
                </h3>
                <p className="text-gray-500 text-sm">
                  Click on an application to view and edit details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTracker;
