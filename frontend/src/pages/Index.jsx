import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Importar useAuth

export default function Index() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Obtener user y loading

  useEffect(() => {
    if (!loading && user) { // Solo redirigir si no está cargando y hay un usuario
      if (user.rol === 'PRODUCTOR') { // Usar user.rol en lugar de user.role
        navigate('/dashboard-productor', { replace: true });
      } else if (user.rol === 'COMPRADOR') { // Usar user.rol
        navigate('/dashboard-comprador', { replace: true });
      }
      // Si hay otros roles, agregar aquí
    }
    // Si !user y !loading, no redirigir, mostrar la landing page
  }, [user, loading, navigate]); // Añadir navigate a las dependencias

  if (loading) {
    return <div>{t('general.loading', 'Cargando...')}</div>; // Mostrar mensaje de carga
  }

  return (
    <div>
      {/* Contenido de la landing page pública */}
      <h1>{t('index.welcome', 'Bienvenido a AgroMarket')}</h1>
      <p>{t('index.description', 'Tu mercado de productos agrícolas frescos.')}</p>
      {/* Puedes agregar más contenido aquí */}
    </div>
  );
}
