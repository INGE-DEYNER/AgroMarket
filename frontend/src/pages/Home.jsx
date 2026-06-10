import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        color: 'white',
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 'bold' }}>
          {t('index.welcome', 'Bienvenido a AgroMarket')}
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9 }}>
          {t('index.description', 'Tu mercado de productos agrícolas frescos directamente del productor')}
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/catalogo" style={{
            background: 'white', color: '#2E7D32',
            padding: '14px 32px', borderRadius: '8px',
            textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem'
          }}>
            {t('nav.catalogo', 'Ver Catálogo')}
          </Link>
          {!user && (
            <Link to="/registro" style={{
              background: 'transparent', color: 'white',
              border: '2px solid white',
              padding: '14px 32px', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem'
            }}>
              {t('auth.registrarse', 'Registrarse')}
            </Link>
          )}
          {user && (
            <Link to={user.role === 'PRODUCTOR' ? '/dashboard-productor' : '/dashboard-comprador'}
              style={{
                background: 'transparent', color: 'white',
                border: '2px solid white',
                padding: '14px 32px', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem'
              }}>
              {t('nav.dashboard', 'Mi Dashboard')}
            </Link>
          )}
        </div>
      </section>

      {/* Características */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '40px', fontSize: '1.8rem' }}>
          {t('home.porque', '¿Por qué AgroMarket?')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🌿', titulo: t('home.fresco', 'Productos Frescos'), desc: t('home.frescoDesc', 'Directo del campo a tu mesa') },
            { icon: '🚚', titulo: t('home.envio', 'Envío Rápido'), desc: t('home.envioDesc', 'Recibe tus pedidos en tiempo record') },
            { icon: '🔒', titulo: t('home.seguro', 'Pago Seguro'), desc: t('home.seguroDesc', 'Transacciones protegidas y confiables') },
            { icon: '👨‍🌾', titulo: t('home.productores', 'Productores Locales'), desc: t('home.productoresDesc', 'Apoya a los agricultores de tu región') },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#f9f9f9', borderRadius: '12px',
              padding: '32px 24px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{item.icon}</div>
              <h3 style={{ color: '#2E7D32', marginBottom: '8px' }}>{item.titulo}</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{
        background: '#f5f5f5', padding: '60px 20px', textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '16px' }}>
          {t('home.listo', '¿Listo para empezar?')}
        </h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          {t('home.listoDesc', 'Únete a miles de compradores y productores en AgroMarket')}
        </p>
        <Link to="/login" style={{
          background: '#2E7D32', color: 'white',
          padding: '14px 40px', borderRadius: '8px',
          textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem'
        }}>
          {t('auth.iniciarSesion', 'Ingresar')}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1B5E20', color: 'white',
        padding: '24px 20px', textAlign: 'center', fontSize: '14px'
      }}>
        <p>© 2026 AgroMarket — {t('home.footer', 'Todos los derechos reservados')}</p>
      </footer>
    </div>
  );
}
