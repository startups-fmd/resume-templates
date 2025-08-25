import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Star,
  Download,
  Target,
  Zap,
  Shield,
  Briefcase,
  GraduationCap,
  Code,
  X,
  File,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResumeAnalysis {
  overallScore: number;
  overallFeedback: string;
  sections: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    education: { score: number; feedback: string };
    skills: { score: number; feedback: string };
  };
  suggestions: string[];
  keywords: string[];
  missingKeywords: string[];
  atsOptimization: string;
  industryRecommendations: string;
}

interface ResumeTipsData {
  summary: { title: string; tips: string[] };
  experience: { title: string; tips: string[] };
  education: { title: string; tips: string[] };
  skills: { title: string; tips: string[] };
  ats: { title: string; tips: string[] };
}

const ResumeTips: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { usage, currentPlan } = useSubscription();
  
  const [activeTab, setActiveTab] = useState<'analysis' | 'tips' | 'templates'>('analysis');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploadStatus, setFileUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [tips, setTips] = useState<ResumeTipsData | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templatePreview, setTemplatePreview] = useState<string>('');
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const limits = currentPlan?.limits || { coverLetters: 0, jobSearches: 0, resumeAnalyses: 0 };
  const remainingAnalyses = limits.resumeAnalyses - usage.resumeAnalyses;

  useEffect(() => {
    fetchTips();
    fetchTemplates();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/resume/tips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTips(data);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/resume/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUploadStatus('uploading');
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('resume.errors.fileSizeLimit'));
        setFileUploadStatus('error');
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(t('resume.errors.invalidFileType'));
        setFileUploadStatus('error');
        return;
      }

      // Simulate file processing
      setTimeout(() => {
        setSelectedFile(file);
        setResumeContent('');
        setFileUploadStatus('success');
        toast.success(t('resume.success.fileUploaded'));
      }, 1000);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileUploadStatus('idle');
    toast.success(t('resume.success.fileRemoved'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Process the file directly
      setFileUploadStatus('uploading');
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('resume.errors.fileSizeLimit'));
        setFileUploadStatus('error');
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(t('resume.errors.invalidFileType'));
        setFileUploadStatus('error');
        return;
      }

      // Simulate file processing
      setTimeout(() => {
        setSelectedFile(file);
        setResumeContent('');
        setFileUploadStatus('success');
        toast.success(t('resume.success.fileUploaded'));
      }, 1000);
    }
  };

  const handleAnalyze = async () => {
         if (!isAuthenticated) {
       toast.error(t('resume.errors.loginRequired'));
       return;
     }

     if (remainingAnalyses <= 0) {
       toast.error(t('resume.errors.limitReached'));
       return;
     }

     if (!resumeContent && !selectedFile) {
       toast.error(t('resume.errors.contentRequired'));
       return;
     }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('resume', selectedFile);
      } else {
        formData.append('content', resumeContent);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      // Debug: Log the environment variable
      console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      
      // Use the backend URL directly since environment variable might not be set
      const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'https://motivai-backend.onrender.com/api';
      
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/resume/analyze`);
      const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        toast.success(t('resume.success.analysisCompleted'));
      } else {
        let errorMessage = t('resume.errors.analysisFailed');
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          errorMessage = response.statusText || errorMessage;
        }
        toast.error(errorMessage);
      }
     } catch (error) {
       console.error('Analysis error:', error);
       toast.error(t('resume.errors.analysisFailed'));
     } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleTemplatePreview = async (template: any) => {
    if (!isAuthenticated) {
      toast.error(t('resume.errors.loginRequired'));
      return;
    }

    setIsLoadingTemplate(true);
    try {
      // Use the backend URL directly since environment variable might not be set
      const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'https://motivai-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/resume/templates/${template.id}/preview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTemplate(template);
        setTemplatePreview(data.content);
      } else if (response.status === 403) {
        const error = await response.json();
        if (error.requiresUpgrade) {
          toast.error('This template requires a premium subscription. Please upgrade your plan.');
        } else {
          toast.error(error.message || 'Failed to load template preview');
        }
      } else {
        toast.error('Failed to load template preview');
      }
    } catch (error) {
      console.error('Template preview error:', error);
      toast.error('Failed to load template preview');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleTemplateDownload = async (template: any) => {
    if (!isAuthenticated) {
      toast.error(t('resume.errors.loginRequired'));
      return;
    }

    try {
      // Use the backend URL directly since environment variable might not be set
      const API_BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'https://motivai-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/resume/templates/${template.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-template-${template.id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template downloaded successfully!');
      } else if (response.status === 403) {
        const error = await response.json();
        if (error.requiresUpgrade) {
          toast.error('This template requires a premium subscription. Please upgrade your plan.');
        } else {
          toast.error(error.message || 'Failed to download template');
        }
      } else {
        toast.error('Failed to download template');
      }
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  const closeTemplatePreview = () => {
    setSelectedTemplate(null);
    setTemplatePreview('');
  };

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
             {t('resume.title')}
           </h1>
           <p className="text-xl text-gray-600">
             {t('resume.subtitle')}
           </p>
        </motion.div>

        {/* Usage Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
                             <span className="text-sm font-medium text-gray-700">
                 {t('resume.analysis.resumeAnalyses')}: {usage.resumeAnalyses}/{limits.resumeAnalyses}
               </span>
             </div>
             <div className="text-sm text-gray-500">
               {remainingAnalyses} {t('resume.analysis.remaining')}
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg shadow-sm p-1 mb-8">
                     {[
             { id: 'analysis', label: t('resume.analysis.title'), icon: Zap },
             { id: 'tips', label: t('resume.tips.title'), icon: FileText },
             { id: 'templates', label: t('resume.templates.title'), icon: Download }
           ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Analysis Form */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                                 <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                   {t('resume.analysis.title')}
                 </h2>
                
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('resume.analysis.uploadLabel')}
                    </label>
                    
                    {/* Upload Area */}
                    <div 
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-300 ${
                        fileUploadStatus === 'uploading' 
                          ? 'border-blue-400 bg-blue-50' 
                          : fileUploadStatus === 'success' 
                          ? 'border-green-400 bg-green-50' 
                          : fileUploadStatus === 'error' 
                          ? 'border-red-400 bg-red-50' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-3 text-center">
                        {fileUploadStatus === 'uploading' ? (
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-blue-700 font-medium">Processing your file...</span>
                            </div>
                          </div>
                        ) : fileUploadStatus === 'success' ? (
                          <div className="flex flex-col items-center space-y-2">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <span className="text-green-700 font-medium">File uploaded successfully!</span>
                          </div>
                        ) : fileUploadStatus === 'error' ? (
                          <div className="flex flex-col items-center space-y-2">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                            <span className="text-red-700 font-medium">Upload failed</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept=".pdf,.doc,.docx,.txt"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, DOC, DOCX, or TXT files up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* File Information */}
                    {selectedFile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <File className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                              <p className="text-xs text-green-600">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={removeFile}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Upload Status Messages */}
                    {fileUploadStatus === 'uploading' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-blue-700">Processing your resume file...</span>
                        </div>
                      </motion.div>
                    )}

                    {fileUploadStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">Please check file type and size (max 5MB)</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Or Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('resume.analysis.contentLabel')}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={8}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                        placeholder={t('resume.analysis.contentPlaceholder')}
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {t('resume.analysis.contentHelper')}
                    </p>
                  </div>

                  {/* Job Description */}
                  <div>
                                         <label className="block text-sm font-medium text-gray-700 mb-2">
                       {t('resume.analysis.jobDescriptionLabel')}
                     </label>
                    <textarea
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                             placeholder={t('resume.analysis.jobDescriptionPlaceholder')}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || remainingAnalyses <= 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                 <span>{t('resume.analysis.analyzing')}</span>
                       </>
                     ) : (
                       <>
                         <Zap className="w-4 h-4" />
                         <span>{t('resume.analysis.analyzeButton')}</span>
                       </>
                     )}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-lg p-8"
                >
                                     <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                     {t('resume.analysis.analysisResults')}
                   </h2>

                  {/* Overall Score */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                                             <h3 className="text-lg font-medium text-gray-900">{t('resume.analysis.overallScore')}</h3>
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}/100
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${getScoreBgColor(analysis.overallScore)}`}>
                      <p className="text-gray-700">{analysis.overallFeedback}</p>
                    </div>
                  </div>

                  {/* Section Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {Object.entries(analysis.sections).map(([section, data]) => (
                      <div key={section} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                          <span className={`font-bold ${getScoreColor(data.score)}`}>
                            {data.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{data.feedback}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  <div className="mb-8">
                                         <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resume.analysis.improvementSuggestions')}</h3>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                                             <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resume.analysis.foundKeywords')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((keyword, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                                             <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resume.analysis.missingKeywords')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword, index) => (
                          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ATS & Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                                             <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resume.analysis.atsOptimization')}</h3>
                      <p className="text-gray-700">{analysis.atsOptimization}</p>
                    </div>
                    <div>
                                             <h3 className="text-lg font-medium text-gray-900 mb-4">{t('resume.analysis.industryRecommendations')}</h3>
                      <p className="text-gray-700">{analysis.industryRecommendations}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {tips && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Object.entries(tips).map(([section, data]) => (
                    <div key={section} className="bg-white rounded-lg shadow-lg p-6">
                                            <div className="flex items-center space-x-2 mb-4">
                        {section === 'summary' && <FileText className="w-5 h-5 text-blue-600" />}
                        {section === 'experience' && <Briefcase className="w-5 h-5 text-green-600" />}
                        {section === 'education' && <GraduationCap className="w-5 h-5 text-purple-600" />}
                        {section === 'skills' && <Code className="w-5 h-5 text-orange-600" />}
                        {section === 'ats' && <Shield className="w-5 h-5 text-red-600" />}
                        <h3 className="text-lg font-semibold text-gray-900">{t(data.titleKey)}</h3>
                      </div>
                      <ul className="space-y-2">
                        {data.tips.map((tipKey: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{t(tipKey)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{t(template?.nameKey || 'resume.templates.defaultName')}</h3>
                        {template?.isPremium && (
                          <Star className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{t(template?.descriptionKey || 'resume.templates.defaultDescription')}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {t(template?.categoryKey || 'resume.templates.defaultCategory')}
                        </span>
                        {template?.isPremium && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            {t('resume.templates.premiumLabel')}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleTemplatePreview(template)}
                          disabled={isLoadingTemplate}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
                        >
                          {isLoadingTemplate ? t('common.loading') : t('resume.templates.previewButton')}
                        </button>
                        <button 
                          onClick={() => handleTemplateDownload(template)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                        >
                          {t('resume.templates.downloadButton')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Template Preview Modal */}
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={closeTemplatePreview}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-6 border-b">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t(selectedTemplate.nameKey)} - Preview
                      </h3>
                      <button
                        onClick={closeTemplatePreview}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg">
                        {templatePreview}
                      </pre>
                    </div>
                    <div className="flex justify-end space-x-3 p-6 border-t">
                      <button
                        onClick={closeTemplatePreview}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => handleTemplateDownload(selectedTemplate)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Download Template
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeTips;
