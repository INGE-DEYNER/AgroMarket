// src/pages/SobreAsafrut.jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';

export default function SobreAsafrut() {
  const [metrics, setMetrics] = useState({
    totalProductores: 18,
    totalProductos: 12,
    calificacion: '4.9★'
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/public/metrics');
        const data = res.data || res;
        if (data) {
          setMetrics({
            totalProductores: data.totalProductores || 18,
            totalProductos: data.totalProductos || 12,
            calificacion: data.calificacion || '4.9★'
          });
        }
      } catch (err) {
        console.error('Error fetching public metrics:', err);
      }
    };
    fetchMetrics();
  }, []);

  const galleryImages = [
    { url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600', caption: 'Cultivos de Piña Oro Miel en Chigorodó' },
    { url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600', caption: 'Maracuyás Listos para el Despacho' },
    { url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=600', caption: 'Cosecha Fina de Banano Orgánico de Urabá' },
    { url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=600', caption: 'Aguacates Hass Listos para Recolección' }
  ];

  return (
    <div style={{ background: '#fcfdfc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(rgba(27,67,50,0.85), rgba(27,67,50,0.85)), url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200") no-repeat center/cover',
        color: 'white',
        textAlign: 'center',
        padding: '100px 20px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>Sobre ASAFRUT</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
            Asociación Agropecuaria El Sabor de las Frutas y el Campo de Chigorodó, Antioquia.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        background: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        borderBottom: '1px solid #f0f4f0',
        padding: '30px 20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
        flexWrap: 'wrap',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2d6a4f' }}>{metrics.totalProductores}</div>
          <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productores Activos</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2d6a4f' }}>{metrics.totalProductos}</div>
          <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Variedades de Frutas</div>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2d6a4f' }}>{metrics.calificacion}</div>
          <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Satisfacción Promedio</div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ flex: 1, maxWidth: '1000px', width: '100%', margin: '60px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Story */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="responsive-grid">
          <div>
            <h2 style={{ color: '#1b4332', fontSize: '2.2rem', fontWeight: '800', marginBottom: '20px' }}>Nuestra Historia</h2>
            <p style={{ color: '#4a5568', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '16px' }}>
              ASAFRUT nació en el corazón de la subregión de Urabá con un objetivo claro: dignificar el trabajo de los pequeños agricultores y productores de frutas tropicales de la región.
            </p>
            <p style={{ color: '#4a5568', lineHeight: '1.7', fontSize: '1.05rem' }}>
              Por años, los intermediarios tradicionales reducían los márgenes de ganancia de los agricultores, encareciendo al mismo tiempo el costo para el consumidor final. A través de AgroMarket, eliminamos los intermediarios y creamos una conexión comercial directa y segura basada en la tecnología de fideicomiso comercial.
            </p>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600" 
              alt="Campo agrícola en Urabá" 
              style={{ width: '100%', borderRadius: '16px', boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }} 
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="responsive-grid">
          <div style={{ background: '#f4fbf7', padding: '40px', borderRadius: '16px', border: '1px solid rgba(45,106,79,0.08)' }}>
            <h3 style={{ color: '#1b4332', fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Nuestra Misión</h3>
            <p style={{ color: '#4a5568', lineHeight: '1.7' }}>
              Fomentar el comercio justo y equitativo de frutas tropicales frescas de Urabá, empoderando a las familias agricultoras mediante herramientas tecnológicas que mejoren la distribución, reduzcan pérdidas poscosecha y brinden frutas de excelente calidad a los hogares y empresas de Colombia.
            </p>
          </div>
          <div style={{ background: '#f4fbf7', padding: '40px', borderRadius: '16px', border: '1px solid rgba(45,106,79,0.08)' }}>
            <h3 style={{ color: '#1b4332', fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>Nuestra Visión</h3>
            <p style={{ color: '#4a5568', lineHeight: '1.7' }}>
              Consolidarnos para el año 2028 como la principal asociación tecnológica-agropecuaria del departamento de Antioquia, siendo modelo de comercio justo en fideicomiso y desarrollo agrícola sostenible para frutas tropicales en toda Colombia.
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <h2 style={{ color: '#1b4332', fontSize: '2rem', fontWeight: '800', marginBottom: '24px', textAlign: 'center' }}>Galería del Campo y Cosecha</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {galleryImages.map((img, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f4f0',
                  transition: 'transform 0.3s'
                }}
                className="gallery-card"
              >
                <img src={img.url} alt={img.caption} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4a5568', fontWeight: '500' }}>{img.caption}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
      
      {/* Styles for hover effect and responsive grid */}
      <style>{`
        .gallery-card:hover {
          transform: translateY(-4px);
        }
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
