// src/pages/ComoFunciona.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ComoFunciona() {
  const steps = [
    {
      number: '01',
      title: 'Regístrate Fácilmente',
      desc: 'Crea tu cuenta gratis como comprador, productor o empresa. Rellena tus datos básicos de contacto y ubicación en menos de un minuto.',
      color: '#2d6a4f',
      svg: (
        <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )
    },
    {
      number: '02',
      title: 'Explora y Elige',
      desc: 'Navega por nuestro catálogo de frutas tropicales frescas. Conéctate con productores verificados de la región de Urabá y revisa sus valoraciones.',
      color: '#52b788',
      svg: (
        <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      )
    },
    {
      number: '03',
      title: 'Compra con Fideicomiso',
      desc: 'Realiza tu pago simulado mediante PSE o Tarjeta. Retenemos tus fondos de forma segura en un fideicomiso seguro hasta que recibas tus frutas.',
      color: '#1b4332',
      svg: (
        <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
        </svg>
      )
    },
    {
      number: '04',
      title: 'Recibe en tu Puerta',
      desc: 'El productor despacha el pedido y tú le haces seguimiento logístico. Cuando llega, confirmas la entrega y liberamos el dinero al agricultor.',
      color: '#40916c',
      svg: (
        <svg viewBox="0 0 24 24" width="60" height="60" fill="currentColor">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      )
    }
  ];

  return (
    <div style={{ background: '#f4fbf7', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Comercio Seguro y Directo
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginTop: '20px', marginBottom: '16px', lineHeight: '1.2' }}>
            ¿Cómo Funciona AgroMarket?
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: '0.9', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            Conectamos a pequeños productores de frutas tropicales de Urabá directamente con fruterías, empresas y familias colombianas de manera transparente.
          </p>
        </div>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(82, 183, 136, 0.1)', filter: 'blur(80px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-20%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(45, 106, 79, 0.2)', filter: 'blur(80px)' }}></div>
      </div>

      {/* Timeline Section */}
      <div style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ textAlign: 'center', color: '#1b4332', fontSize: '2.2rem', marginBottom: '48px', fontWeight: '800' }}>
          Tu proceso en 4 sencillos pasos
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
          {/* Vertical Center Line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '40px',
            bottom: '40px',
            width: '4px',
            background: 'linear-gradient(to bottom, #2d6a4f, #52b788)',
            transform: 'translateX(-50%)',
            opacity: 0.15,
            zIndex: 1
          }} className="timeline-line"></div>

          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={idx} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                  position: 'relative',
                  zIndex: 2
                }}
                className="timeline-item"
              >
                {/* Text Content */}
                <div style={{
                  width: '45%',
                  background: 'white',
                  padding: '30px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(45, 106, 79, 0.05)',
                  border: '1px solid rgba(45, 106, 79, 0.08)',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: '3rem', fontWeight: '900', color: step.color, opacity: 0.15, position: 'absolute', right: '20px', top: '10px' }}>
                    {step.number}
                  </span>
                  <h3 style={{ color: '#1b4332', fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: '#4a5568', lineHeight: '1.6', fontSize: '0.98rem' }}>
                    {step.desc}
                  </p>
                </div>

                {/* Center Badge */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: step.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  zIndex: 3
                }} className="timeline-badge">
                  {step.svg}
                </div>

                {/* Empty Placeholder for symmetrical layout */}
                <div style={{ width: '45%' }} className="timeline-spacer"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Escrow explanation */}
      <div style={{ background: 'white', padding: '60px 20px', borderTop: '1px solid #eef2ee', borderBottom: '1px solid #eef2ee' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#1b4332', fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>
            ¿Por qué es seguro comprar aquí?
          </h2>
          <p style={{ color: '#4a5568', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '32px' }}>
            Nuestra plataforma utiliza un sistema de **Fideicomiso Comercial (Escrow)**. Cuando compras un producto, tu dinero no va directamente al productor de inmediato. Lo retenemos de manera segura hasta que confirmas que has recibido tus frutas tropicales frescas y a satisfacción. De este modo, protegemos la inversión de los compradores y garantizamos el pago de los agricultores.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '220px' }}>
              <div style={{ color: '#2d6a4f', fontSize: '2rem', fontWeight: 'bold' }}>100%</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>Productores Verificados</div>
            </div>
            <div style={{ maxWidth: '220px' }}>
              <div style={{ color: '#2d6a4f', fontSize: '2rem', fontWeight: 'bold' }}>PSE / TC</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>Medios de Pago Seguros</div>
            </div>
            <div style={{ maxWidth: '220px' }}>
              <div style={{ color: '#2d6a4f', fontSize: '2rem', fontWeight: 'bold' }}>24/7</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>Soporte de IA de Urabá</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f4fbf7' }}>
        <h3 style={{ color: '#1b4332', fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>
          ¿Listo para probar las mejores frutas de Urabá?
        </h3>
        <p style={{ color: '#4a5568', fontSize: '1.05rem', marginBottom: '24px' }}>
          Explora nuestro catálogo y apoya directamente a los productores locales hoy.
        </p>
        <Link to="/catalogo" style={{
          display: 'inline-block',
          background: '#2d6a4f',
          color: 'white',
          padding: '14px 32px',
          borderRadius: '30px',
          fontWeight: 'bold',
          textDecoration: 'none',
          boxShadow: '0 6px 20px rgba(45, 106, 79, 0.3)',
          transition: 'all 0.3s'
        }} className="btn-cta-hover">
          Ver Catálogo de Frutas
        </Link>
      </div>

      <Footer />
      
      {/* Styles for animation and responsive */}
      <style>{`
        .btn-cta-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 106, 79, 0.4);
          background-color: #25553e;
        }
        @media (max-width: 768px) {
          .timeline-line {
            left: 20px !important;
            transform: none !important;
          }
          .timeline-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px;
            padding-left: 50px;
          }
          .timeline-item > div {
            width: 100% !important;
          }
          .timeline-badge {
            position: absolute;
            left: 0;
            top: 0;
            width: 44px !important;
            height: 44px !important;
          }
          .timeline-badge svg {
            width: 24px !important;
            height: 24px !important;
          }
          .timeline-spacer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
