import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Globe, 
  User, 
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const navigation = [
    { name: t('navigation.home'), href: '/', public: true },
    { name: t('navigation.coverLetters'), href: '/cover-letter', public: false },
    { name: t('navigation.resumeTips'), href: '/resume-tips', public: false },
    { name: t('navigation.jobTracker'), href: '/job-tracker', public: false },
    { name: t('navigation.pricing'), href: '/pricing', public: true },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">MotivAI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isPublic = item.public || isAuthenticated;
                const isCurrentlyActive = isActive(item.href);
                
                if (isPublic) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isCurrentlyActive
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                } else {
                  return (
                    <div key={item.name} className="relative group">
                      <Link
                        to="/signup"
                        className="text-sm font-medium text-gray-300 hover:text-gray-400 transition-colors duration-200 cursor-pointer"
                      >
                        {item.name}
                      </Link>
                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        <div className="text-center">
                          <div>{t('navigation.signupRequired')}</div>
                          <div className="text-green-400 font-medium">{t('navigation.signupFree')}</div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                      </div>
                    </div>
                  );
                }
              })}
            </nav>

            {/* Right side - Language, Auth */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {i18n.language === 'en' ? 'EN' : 'FR'}
                </span>
              </button>

              {/* Auth Buttons / User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {t('navigation.profile')}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {t('navigation.settings')}
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('navigation.logout')}
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {t('navigation.signup')}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isPublic = item.public || isAuthenticated;
                const isCurrentlyActive = isActive(item.href);
                
                if (isPublic) {
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        isCurrentlyActive
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                } else {
                  return (
                    <div key={item.name} className="relative">
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-gray-400 transition-colors duration-200 cursor-pointer"
                      >
                        {item.name}
                      </Link>
                      <div className="px-3 py-1 text-xs text-gray-500">
                        {t('navigation.signupRequired')} - {t('navigation.signupFree')}
                      </div>
                    </div>
                  );
                }
              })}
              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {t('navigation.login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                  >
                    {t('navigation.signup')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MotivAI</span>
              </div>
              <p className="text-gray-600 text-sm">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.product')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  {isAuthenticated ? (
                    <Link to="/cover-letter" className="hover:text-primary-600">{t('navigation.coverLetters')}</Link>
                  ) : (
                    <Link to="/signup" className="hover:text-primary-600 text-gray-400">{t('navigation.coverLetters')}</Link>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <Link to="/resume-tips" className="hover:text-primary-600">{t('navigation.resumeTips')}</Link>
                  ) : (
                    <Link to="/signup" className="hover:text-primary-600 text-gray-400">{t('navigation.resumeTips')}</Link>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <Link to="/job-search" className="hover:text-primary-600">{t('navigation.jobSearch')}</Link>
                  ) : (
                    <Link to="/signup" className="hover:text-primary-600 text-gray-400">{t('navigation.jobSearch')}</Link>
                  )}
                </li>
                <li><Link to="/pricing" className="hover:text-primary-600">{t('navigation.pricing')}</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button className="hover:text-primary-600 text-left w-full">{t('footer.helpCenter')}</button></li>
                <li><button className="hover:text-primary-600 text-left w-full">{t('footer.contactUs')}</button></li>
                <li><button className="hover:text-primary-600 text-left w-full">{t('footer.privacyPolicy')}</button></li>
                <li><button className="hover:text-primary-600 text-left w-full">{t('footer.termsOfService')}</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-center text-sm text-gray-600">
                {t('footer.copyright')}
              </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <span className="text-sm text-gray-500">{t('footer.language')}</span>
                <button
                  onClick={toggleLanguage}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  {i18n.language === 'en' ? 'Français' : 'English'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
