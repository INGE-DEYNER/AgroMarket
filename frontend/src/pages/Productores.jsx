import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../utils/api';

export default function Productores() {
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Intentar obtener productores desde la API real
        const res = await api.get('/public/productores');
        const data = res.data ?? res;
        setProductores(Array.isArray(data) ? data : (data.content ?? []));
      } catch {
        // Fallback: buscar usuarios con rol PRODUCTOR
        try {
          const res2 = await api.get('/usuarios?rol=PRODUCTOR&page=0&size=20');
          const data2 = res2.data ?? res2;
          setProductores(Array.isArray(data2) ? data2 : (data2.content ?? []));
        } catch {
          setError('No se pudieron cargar los productores en este momento.');
          setProductores([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ background: '#f9fbf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e8f5e9', color: '#2e7d32', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '16px' }}>
            <span>🌿</span> ASAFRUT · Urabá Antioqueño
          </div>
          <h1 style={{ color: 'var(--primary-dark, #1b4332)', fontSize: '2.5rem', fontWeight: 'bold' }}>
            Nuestros Productores Aliados
          </h1>
          <p style={{ color: 'var(--text-dim, #6b7280)', fontSize: '1.1rem', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>
            Productores certificados de la región del Urabá Antioqueño que garantizan la máxima frescura del campo a tu mesa.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2ee', height: '380px' }}>
                <div style={{ height: '220px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '6px', width: '60%' }} />
                  <div style={{ height: '20px', background: '#f0f0f0', borderRadius: '6px', width: '80%' }} />
                  <div style={{ height: '14px', background: '#f0f0f0', borderRadius: '6px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <p style={{ fontSize: '1rem', marginBottom: '20px' }}>{error}</p>
            <Link to="/catalogo" style={{ background: 'var(--primary, #385723)', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
              Ver Catálogo de Productos
            </Link>
          </div>
        )}

        {!loading && !error && productores.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌱</div>
            <h3 style={{ fontSize: '1.4rem', color: '#374151', marginBottom: '10px' }}>Pronto habrá productores aquí</h3>
            <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
              Los productores de ASAFRUT están registrándose en la plataforma. ¡Vuelve pronto!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/catalogo" style={{ background: 'var(--primary, #385723)', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
                Ver Catálogo
              </Link>
              <Link to="/registro?rol=PRODUCTOR" style={{ background: 'white', color: 'var(--primary, #385723)', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', border: '2px solid var(--primary, #385723)' }}>
                Registrarme como Productor
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && productores.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {productores.map((p, idx) => {
              const nombre = p.nombre || p.name || `Productor ${idx + 1}`;
              const ubicacion = p.ubicacion || p.ciudad || p.municipio || 'Urabá, Antioquia';
              const foto = p.fotoUrl || p.foto || p.imagenUrl || null;
              const frutas = p.productos || p.cultivos || [];
              const calificacion = p.calificacionPromedio ?? p.calificacion ?? null;
              const bio = p.bio || p.descripcion || p.experiencia || 'Productor certificado de la región del Urabá Antioqueño.';

              return (
                <div key={p.id || idx} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2ee', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: '220px', background: 'linear-gradient(135deg, #385723 0%, #2d6a4f 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {foto ? (
                      <img src={foto} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : null}
                    <div style={{ display: foto ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                        {nombre.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>Productor ASAFRUT</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {calificacion && (
                      <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        {Number(calificacion).toFixed(1)} · Productor Certificado
                      </span>
                    )}
                    <h3 style={{ color: '#1f2937', fontSize: '1.25rem', margin: '8px 0 4px 0' }}>{nombre}</h3>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {ubicacion}
                    </span>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '16px', flex: 1, lineHeight: '1.5' }}>{bio}</p>
                    {frutas.length > 0 && (
                      <div style={{ borderTop: '1px solid #f0f4f0', paddingTop: '12px' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Cultivos Principales:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {frutas.slice(0, 4).map((f, i) => (
                            <span key={i} style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {typeof f === 'string' ? f : f.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA al final */}
        {!loading && (
          <div style={{ textAlign: 'center', marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, #385723 0%, #2d6a4f 100%)', borderRadius: '20px', color: 'white' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>¿Eres productor de ASAFRUT?</h2>
            <p style={{ opacity: 0.85, marginBottom: '24px' }}>
              Únete a la plataforma y vende tus productos directamente a compradores de la región.
            </p>
            <Link to="/registro?rol=PRODUCTOR" style={{ background: 'white', color: '#385723', padding: '14px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '1rem' }}>
              Registrarme como Productor →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
