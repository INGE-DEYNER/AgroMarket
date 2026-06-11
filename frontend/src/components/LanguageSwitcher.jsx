import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || 'es');

  useEffect(() => {
    const handler = (lng) => setLang(lng);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('agromarket.lang', lng);
    if (lng === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lng);
    }
  };

  return (
    <select
      value={lang}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        padding: '6px 32px 6px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(26,92,42,0.2)',
        background: '#fff',
        fontSize: '0.85rem',
        color: 'var(--text-dark)',
        cursor: 'pointer',
        fontWeight: 500,
      }}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
      <option value="pt">Português</option>
      <option value="fr">Français</option>
    </select>
  );
}

export default LanguageSwitcher;
