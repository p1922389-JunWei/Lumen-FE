import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
      aria-label="Toggle language"
    >
      <Globe className="w-5 h-5 text-gray-600" />
      <span className="font-medium text-gray-700">
        {language === 'en' ? '中文' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;
