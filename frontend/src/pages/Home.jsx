import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/home.css';

// ── Skeleton loader reutilizable ──────────────────────────────
function Skeleton({ width = '100%', height = '20px', borderRadius = '6px' }) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

// ── Card de producto skeleton ─────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <Skeleton height="200px" borderRadius="12px 12px 0 0" />
      <div className="product-info" style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
        <Skeleton height="18px" width="70%" />
        <Skeleton height="14px" width="50%" />
        <Skeleton height="22px" width="40%" />
        <Skeleton height="36px" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [productos, setProductos] = useState([]);       // datos reales de la API
  const [resenas, setResenas] = useState([]);           // reseñas reales de la API
  const [metrics, setMetrics] = useState(null);         // null = cargando
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);

  // ── Utilidad para extraer array de cualquier respuesta ───────
  const toArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.content)) return res.data.content;
    }
    if (Array.isArray(res.content)) return res.content;
    return [];
  };

  // ── Cargar productos destacados ──────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingProductos(true);
      try {
        const data = await api.get('/productos?page=0&size=4&sort=fechaCreacion,desc');
        const items = toArray(data);
        setProductos(items);

        // Calcular métricas REALES
        if (items.length > 0) {
          const productores = new Set(
            items.map(p => p.productorId || p.productor?.id || p.productoId).filter(Boolean)
          ).size;
          const avgPrice = Math.round(
            items.reduce((s, p) => s + Number(p.precio || 0), 0) / items.length
          );
          const ratings = items.map(p => Number(p.calificacionPromedio || p.calificacion || 0)).filter(r => r > 0);
          const avgRating = ratings.length > 0
            ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
            : null;

          setMetrics({
            totalProductos: items.length,
            totalProductores: productores || null,
            precioPromedio: avgPrice > 0 ? `$${avgPrice.toLocaleString('es-CO')}` : null,
            calificacion: avgRating ? `${avgRating}★` : null,
          });
        } else {
          setMetrics({ totalProductos: 0, totalProductores: null, precioPromedio: null, calificacion: null });
        }
      } catch {
        setProductos([]);
        setMetrics({ totalProductos: null, totalProductores: null, precioPromedio: null, calificacion: null });
      } finally {
        setLoadingProductos(false);
      }
    })();
  }, []);

  // ── Cargar reseñas reales ────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingResenas(true);
      try {
        const data = await api.get('/resenas?page=0&size=3&sort=fechaCreacion,desc');
        setResenas(toArray(data));
      } catch {
        setResenas([]);
      } finally {
        setLoadingResenas(false);
      }
    })();
  }, []);

  // ── Animación scroll ─────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.animate-fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [productos, resenas]);

  return (
    <div className="home-root">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              🌿 ASAFRUT · Chigorodó, Urabá
            </div>
            <h1 className="hero-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              {t('home.heroTitle', 'Del campo de')} <span>{t('home.heroTitleSpan', 'Urabá')}</span>{' '}
              {t('home.heroTitleEnd', 'directamente a tu mesa.')}
            </h1>
            <p className="hero-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              {t('home.heroSub', 'Conectamos productores agrícolas con compradores, eliminando intermediarios. Frutas frescas, precios justos, trazabilidad total.')}
            </p>

            <div className="hero-bullets animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              {[
                t('home.bullet1', 'Productores activos de la región de Urabá'),
                t('home.bullet2', 'Pagos seguros con PSE y tarjeta'),
                t('home.bullet3', 'Seguimiento en tiempo real de tu pedido'),
              ].map((b, i) => (
                <div key={i} className="hero-bullet">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {b}
                </div>
              ))}
            </div>

            <div className="hero-btns animate-fade-up" style={{ transitionDelay: '0.4s' }}>
              <Link to="/catalogo" className="btn btn-primary btn-lg">
                {t('home.viewCatalog', 'Ver catálogo →')}
              </Link>
              {!user && (
                <Link to="/registro" className="btn btn-secondary btn-lg">
                  {t('home.iAmProducer', 'Soy productor')}
                </Link>
              )}
              {user && (
                <Link
                  to={user.rol === 'PRODUCTOR' ? '/dashboard-productor' : '/dashboard-comprador'}
                  className="btn btn-secondary btn-lg"
                >
                  {t('home.goToDashboard', 'Mi panel →')}
                </Link>
              )}
            </div>
          </div>

          <div className="hero-right animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
                alt={t('home.heroImgAlt', 'Frutas frescas')}
                className="hero-img"
              />
            </div>
            <div className="float-card float-card-1">
              <div className="float-card-1-title">🚚 {t('home.floatCard1.title', 'Pedido en camino')}</div>
              <div className="float-card-1-sub">{t('home.floatCard1.desc', 'Seguimiento en tiempo real')}</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" />
              </div>
            </div>
            <div className="float-card float-card-2">
              <div className="float-card-2-val">
                {metrics?.calificacion ?? '⭐ —'}
              </div>
              <div className="float-card-2-sub">{t('home.floatCard2.desc', 'Calificación promedio')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS ─────────────────────────────────────────── */}
      <section className="metrics">
        <div className="metrics-grid">
          {[
            {
              val: metrics === null ? '—' : (metrics.totalProductos > 0 ? `${metrics.totalProductos}` : '—'),
              label: t('home.metrics.products', 'Productos publicados'),
            },
            {
              val: metrics?.totalProductores ? `${metrics.totalProductores}` : '—',
              label: t('home.metrics.producers', 'Productores activos'),
            },
            {
              val: metrics?.precioPromedio ?? '—',
              label: t('home.metrics.avgPrice', 'Precio promedio'),
            },
            {
              val: metrics?.calificacion ?? '—',
              label: t('home.metrics.avgRating', 'Calificación promedio'),
            },
          ].map((m, i) => (
            <div key={i} className="metric-item animate-fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="metric-val">{m.val}</div>
              <div className="metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (estático, no cambia) ───────────────── */}
      <section className="how-it-works" id="como-funciona">
        <div className="section-eyebrow animate-fade-up">{t('home.how.eyebrow', 'PROCESO')}</div>
        <h2 className="section-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
          {t('home.how.title', 'Tan fácil como 3 pasos')}
        </h2>
        <p className="section-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
          {t('home.how.sub', 'Comprar directo al productor nunca fue tan sencillo y seguro.')}
        </p>
        <div className="steps-grid">
          {[
            { num: '01', title: t('home.how.step1.title', 'Crea tu cuenta'), desc: t('home.how.step1.desc', 'Regístrate en menos de un minuto como comprador o productor y accede a la plataforma.'), icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
            { num: '02', title: t('home.how.step2.title', 'Encuentra tus frutas'), desc: t('home.how.step2.desc', 'Navega el catálogo, filtra por tipo, precio y disponibilidad para encontrar lo que necesitas.'), icon: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
            { num: '03', title: t('home.how.step3.title', 'Recibe en casa'), desc: t('home.how.step3.desc', 'Paga de forma segura y rastrea tu pedido en tiempo real hasta que llegue a tu puerta.'), icon: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
          ].map((step, i) => (
            <div key={i} className="step-card animate-fade-up" style={{ transitionDelay: `${0.3 + i * 0.1}s` }}>
              <div className="step-icon-wrap">
                <div className="step-num">{step.num}</div>
                <svg viewBox="0 0 24 24"><path d={step.icon} /></svg>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS (datos reales o skeleton) ───────── */}
      <section className="featured">
        <div className="featured-header animate-fade-up">
          <div>
            <div className="section-eyebrow">{t('home.featured.eyebrow', 'DESTACADOS')}</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {t('home.featured.title', 'Frutas de temporada')}
            </h2>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">
            {t('home.featured.viewAll', 'Ver catálogo completo →')}
          </Link>
        </div>

        <div className="products-grid">
          {loadingProductos ? (
            // Skeleton mientras carga
            [1, 2, 3, 4].map(i => <ProductCardSkeleton key={i} />)
          ) : productos.length === 0 ? (
            // Sin productos aún — placeholder neutro
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌱</div>
              <p>{t('home.featured.empty', 'Los productos aparecerán aquí cuando los productores publiquen su catálogo.')}</p>
              <Link to="/registro" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
                {t('home.featured.beFirst', 'Sé el primero en publicar')}
              </Link>
            </div>
          ) : (
            // Productos reales de la API
            productos.slice(0, 4).map((p, i) => {
              const stock = p.cantidadDisponible ?? p.stock ?? 0;
              const productor = p.productor?.nombre || p.productorNombre || p.nombreProductor || '—';
              const rating = p.calificacionPromedio ?? p.calificacion;
              return (
                <div key={p.id || i} className="product-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
                  <img
                    src={p.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                    alt={p.nombre}
                    className="product-img"
                    loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'; }}
                  />
                  <div className="product-info">
                    <h3 className="product-name">{p.nombre}</h3>
                    <div className="product-producer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      {productor}
                    </div>
                    <div className="product-price">
                      ${Number(p.precio).toLocaleString('es-CO')}/kg
                    </div>
                    <div className="product-meta">
                      <div className="product-rating">
                        {rating ? `★ ${Number(rating).toFixed(1)}` : t('home.featured.noRating', 'Sin calificación')}
                      </div>
                      <div className={`product-badge${stock === 0 ? ' out-of-stock' : ''}`}>
                        {stock > 0 ? t('home.featured.available', 'Disponible') : t('home.featured.soldOut', 'Sin stock')}
                      </div>
                    </div>
                    <Link to={`/catalogo`} className="btn btn-primary product-btn">
                      {t('home.featured.orderNow', 'Pedir ahora')}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ── FOR PRODUCERS (estático) ─────────────────────────── */}
      <section className="for-producers" id="asafrut">
        <div className="fp-content">
          <div className="fp-left">
            <div className="fp-badge animate-fade-up">{t('home.forProducers.badge', 'PARA PRODUCTORES')}</div>
            <h2 className="fp-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              {t('home.forProducers.title', 'Vende tus frutas directamente. Sin intermediarios.')}
            </h2>
            <p className="fp-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              {t('home.forProducers.sub', 'Únete a la red de ASAFRUT y maximiza tus ganancias conectando directo con los compradores finales.')}
            </p>
            <div className="fp-list animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              {[
                t('home.forProducers.f1', 'Publica tus productos en minutos'),
                t('home.forProducers.f2', 'Recibe pagos seguros directamente'),
                t('home.forProducers.f3', 'Gestiona tus pedidos desde el panel'),
                t('home.forProducers.f4', 'Comunícate con compradores en tiempo real'),
              ].map((item, i) => (
                <div key={i} className="fp-item">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
            <Link to="/registro" className="btn btn-white btn-lg animate-fade-up" style={{ transitionDelay: '0.4s' }}>
              {t('home.forProducers.cta', 'Quiero ser productor')}
            </Link>
          </div>
          <div className="fp-right animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="fp-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800"
                alt={t('home.forProducers.imgAlt', 'Productor agrícola')}
                className="fp-img"
                loading="lazy"
              />
            </div>
            <div className="fp-float">
              <div className="fp-float-title">📦 {t('home.fpFloat.title', 'Nuevo pedido recibido')}</div>
              <div className="fp-float-desc">{t('home.fpFloat.desc', 'Notificaciones en tiempo real')}</div>
              <div className="fp-float-badge">{t('home.fpFloat.badge', 'En proceso')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (solo si hay reseñas reales) ─────────── */}
      {!loadingResenas && resenas.length > 0 && (
        <section className="testimonials" id="testimonios">
          <div className="test-header animate-fade-up">
            <div className="section-eyebrow">{t('home.testimonials.eyebrow', 'TESTIMONIOS')}</div>
            <h2 className="section-title">{t('home.testimonials.title', 'Lo que dicen nuestros usuarios')}</h2>
          </div>
          <div className="test-grid">
            {resenas.slice(0, 3).map((r, i) => {
              const nombre = r.compradorNombre || r.nombre || t('home.testimonials.verified', 'Usuario verificado');
              const avatar = nombre.substring(0, 2).toUpperCase();
              return (
                <div key={r.id || i} className="test-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
                  <div className="test-quote-mark">"</div>
                  <div className="test-stars">{'★'.repeat(Math.min(r.calificacion || 5, 5))}</div>
                  <div className="test-content">{r.comentario}</div>
                  <div className="test-author">
                    <div className="test-avatar">{avatar}</div>
                    <div>
                      <div className="test-name">{nombre}</div>
                      <div className="test-role">
                        {r.productoNombre
                          ? `${t('home.testimonials.buyer', 'Comprador')} · ${r.productoNombre}`
                          : t('home.testimonials.buyer', 'Comprador · AgroMarket')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="cta-final">
        <div className="cta-overlay" />
        <div className="cta-content">
          <h2 className="cta-title animate-fade-up">{t('home.cta.title', '¿Listo para empezar?')}</h2>
          <p className="cta-sub animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            {t('home.cta.sub', 'Únete a AgroMarket y sé parte del comercio justo agrícola.')}
          </p>
          <div className="cta-btns animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <Link to="/catalogo" className="btn btn-white btn-lg">
              {t('home.cta.explore', 'Explorar catálogo')}
            </Link>
            <Link to="/registro" className="btn btn-outline-white btn-lg">
              {t('home.cta.register', 'Registrarme gratis')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="nav-brand" style={{ color: '#fff', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24" style={{ fill: 'var(--green-light)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
              </svg>
              AgroMarket
            </div>
            <p className="footer-desc">
              {t('home.footer.desc', 'Plataforma oficial de comercialización para la Asociación de Agricultores ASAFRUT.')}
            </p>
          </div>
          <div>
            <h3 className="footer-col-title">{t('home.footer.platform', 'Plataforma')}</h3>
            <div className="footer-links">
              <Link to="/catalogo">{t('nav.catalogo', 'Catálogo')}</Link>
              <a href="#como-funciona">{t('nav.howItWorks', 'Cómo funciona')}</a>
              <a href="#asafrut">{t('nav.about', 'Sobre ASAFRUT')}</a>
            </div>
          </div>
          <div>
            <h3 className="footer-col-title">{t('home.footer.access', 'Acceso')}</h3>
            <div className="footer-links">
              <Link to="/login">{t('nav.ingresa', 'Iniciar sesión')}</Link>
              <Link to="/registro">{t('nav.registrate', 'Registrarse')}</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-col-title">{t('home.footer.contact', 'Contacto')}</h3>
            <div className="footer-contact">
              <span>📍 {t('home.footer.address', 'Chigorodó, Antioquia')}</span>
              <span>📧 contacto@agromarket.co</span>
              <span>📞 +57 310 000 0000</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 AgroMarket · ASAFRUT · {t('home.footer.rights', 'Todos los derechos reservados')}
        </div>
      </footer>

      {/* Estilos para skeleton animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .product-badge.out-of-stock {
          background: #fee2e2;
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}
