import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (lng === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lng);
    }
  };

  return (
    <div>
      <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="zh">中文</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;