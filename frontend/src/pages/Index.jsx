import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the root path handled by React Router
    navigate('/');
  }, [navigate]);

  return (
    <div>
      <p>{t('general.redirecting')}</p>
    </div>
  );
}