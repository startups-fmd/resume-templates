import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Edit3, 
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CoverLetterForm {
  jobTitle: string;
  company: string;
  jobDescription: string;
  yourName: string;
  email: string;
  phone: string;
  experience: string;
  skills: string;
  achievements: string;
  motivation: string;
  cv?: File;
}

const CoverLetter: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentPlan, canUseFeature, usage } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [formData, setFormData] = useState<CoverLetterForm>({
    jobTitle: '',
    company: '',
    jobDescription: '',
    yourName: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    achievements: '',
    motivation: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.type)) {
        setCvFile(file);
        toast.success('CV uploaded successfully!');
      } else {
        toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      }
    }
  };

  const generateCoverLetter = async () => {
    if (!user) {
      toast.error('Please log in to generate cover letters');
      return;
    }

    if (!canUseFeature('coverLetters')) {
      toast.error('You have reached your cover letter limit. Please upgrade your plan.');
      return;
    }

    // Validate required fields
    const requiredFields = ['jobTitle', 'company', 'jobDescription', 'yourName', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CoverLetterForm]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value);
        }
      });
      
      // Add CV file if uploaded
      if (cvFile) {
        formDataToSend.append('cv', cvFile);
      }
      
      // Add language
      formDataToSend.append('language', localStorage.getItem('i18nextLng') || 'en');

      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate cover letter');
      }

      setCoverLetter(data.coverLetter.content);
      setShowPreview(true);
      toast.success('Cover letter generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate cover letter');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${formData.company}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const usagePercentage = currentPlan?.limits.coverLetters === -1 ? 0 : (usage.coverLetters / (currentPlan?.limits.coverLetters || 1)) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('coverLetter.title')}
        </h1>
        <p className="text-gray-600">
          {t('coverLetter.subtitle')}
        </p>
      </div>

      {/* Usage Indicator */}
      {currentPlan?.name === 'free' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              {t('coverLetter.usage.coverLettersUsed')}: {usage.coverLetters} / {currentPlan?.limits.coverLetters === -1 ? '∞' : currentPlan?.limits.coverLetters}
            </span>
            <span className="text-sm text-blue-600">
              {Math.round(usagePercentage)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
                      {currentPlan?.limits.coverLetters !== -1 && usage.coverLetters >= currentPlan.limits.coverLetters && (
            <p className="text-sm text-blue-700 mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {t('coverLetter.usage.reachedLimit')}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {t('coverLetter.sections.jobInformation')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.jobTitle')} *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.company')} *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., TechCorp Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={4}
                  placeholder="Paste the job description here. This helps the AI understand the role requirements and create a more targeted cover letter."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copy and paste the full job description from the job posting
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('coverLetter.sections.yourInformation')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.yourName')} *
                </label>
                <input
                  type="text"
                  name="yourName"
                  value={formData.yourName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('coverLetter.form.experience')} (Optional)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload CV (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your CV to help generate a more personalized cover letter
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <button
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="w-full flex items-center justify-between text-left mb-4"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {t('coverLetter.sections.professionalDetails')} (Optional)
              </h2>
              {showOptionalFields ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            <AnimatePresence>
              {showOptionalFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coverLetter.form.skills')} (Optional)
                      </label>
                      <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="input-field"
                        rows={3}
                        placeholder="e.g., JavaScript, React, Node.js, Project Management"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coverLetter.form.achievements')} (Optional)
                      </label>
                      <textarea
                        name="achievements"
                        value={formData.achievements}
                        onChange={handleInputChange}
                        className="input-field"
                        rows={3}
                        placeholder="e.g., Led a team of 5 developers, Increased efficiency by 30%"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('coverLetter.form.motivation')} (Optional)
                      </label>
                      <textarea
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        className="input-field"
                        rows={3}
                        placeholder="e.g., I'm excited about the opportunity to work on innovative projects"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generateCoverLetter}
              disabled={isGenerating || !canUseFeature('coverLetters')}
              className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{t('coverLetter.form.generate')}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {showPreview ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {t('coverLetter.preview.title')}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="btn-secondary flex items-center space-x-1 text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t('coverLetter.preview.edit')}</span>
                  </button>
                  <button
                    onClick={downloadCoverLetter}
                    className="btn-primary flex items-center space-x-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('coverLetter.form.download')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {coverLetter}
                </pre>
              </div>
            </div>
          ) : (
            <div className="card h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">{t('coverLetter.preview.noLetter')}</p>
                <p className="text-sm">
                  {t('coverLetter.preview.noLetterSubtitle')}
                </p>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('coverLetter.tips.title')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {t('coverLetter.tips.tip1')}
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {t('coverLetter.tips.tip2')}
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {t('coverLetter.tips.tip3')}
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {t('coverLetter.tips.tip4')}
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoverLetter;
