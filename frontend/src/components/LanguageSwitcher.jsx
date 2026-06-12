import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'zh', label: '中' },
  { code: 'ar', label: 'AR' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          style={{
            background: i18n.language === lang.code ? 'var(--primary, #2d6a4f)' : 'transparent',
            color: i18n.language === lang.code ? '#fff' : 'inherit',
            border: '1px solid var(--border-light, #e5e7eb)',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
