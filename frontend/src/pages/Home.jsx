import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/home.css';

const PLACEHOLDER_PRODUCTS = [
  {
    id: 'p1',
    nombre: 'Banano Premium',
    productor: 'Asociación ASAFRUT',
    precio: 3500,
    calificacion: '4.9',
    stock: 100,
    imagenUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500',
    enPromocion: true
  },
  {
    id: 'p2',
    nombre: 'Aguacate Hass',
    productor: 'Asociación ASAFRUT',
    precio: 8000,
    calificacion: '4.8',
    stock: 80,
    imagenUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500'
  },
  {
    id: 'p3',
    nombre: 'Mango de Hilacha',
    productor: 'Asociación ASAFRUT',
    precio: 4000,
    calificacion: '4.7',
    stock: 120,
    imagenUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'
  },
  {
    id: 'p4',
    nombre: 'Guanábana Fresca',
    productor: 'Asociación ASAFRUT',
    precio: 7500,
    calificacion: '4.9',
    stock: 50,
    imagenUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500'
  }
];

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [metrics, setMetrics] = useState({
    productos: '—',
    productores: '—',
    precio: '—',
    calificacion: '—'
  });

  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (res.data.content && Array.isArray(res.data.content)) return res.data.content;
    }
    if (res.content && Array.isArray(res.content)) return res.content;
    return [];
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/productos');
        const items = extractArray(data);
        setProductos(items);

        if (items.length > 0) {
          const uniqueProducers = new Set(
            items.map((p) => p.productor || p.nombreProductor || p.productorNombre).filter(Boolean)
          ).size || 1;
          const avgPrice = Math.round(
            items.reduce((sum, p) => sum + Number(p.precio || 0), 0) / items.length
          );
          const avgRating = (
            items.reduce((sum, p) => sum + Number(p.calificacion || p.calificacionPromedio || 4.8), 0) / items.length
          ).toFixed(1);

          setMetrics({
            productos: String(items.length),
            productores: String(uniqueProducers),
            precio: `$${avgPrice.toLocaleString('es-CO')}`,
            calificacion: `${avgRating}★`
          });
        } else {
          setMetrics({
            productos: '4+',
            productores: '50+',
            precio: '$4.500',
            calificacion: '4.9★'
          });
        }
      } catch (err) {
        console.error('Error loading seasonal products:', err);
        setMetrics({
          productos: '—',
          productores: '—',
          precio: '—',
          calificacion: '—'
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/resenas');
        const items = extractArray(data);
        setResenas(items);
      } catch (err) {
        console.error('Error loading reviews:', err);
      }
    })();
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15,
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerInstance.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-fade-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [productos, resenas]);

  const STATIC_TESTIMONIALS = [
    {
      id: 't1',
      avatar: 'JC',
      name: t('home.testimonials.t1.name', 'Cliente verificado'),
      role: t('home.testimonials.t1.role', 'Comprador · Urabá'),
      content: t('home.testimonials.t1.content', 'La plataforma hace más claro el origen de lo que compro y me permite revisar el catálogo sin depender de intermediarios.')
    },
    {
      id: 't2',
      avatar: 'AP',
      name: t('home.testimonials.t2.name', 'Productor verificado'),
      role: t('home.testimonials.t2.role', 'Productor · Chigorodó'),
      content: t('home.testimonials.t2.content', 'El panel centraliza pedidos, mensajes y envíos en un solo lugar, así el trabajo diario se vuelve más simple.')
    },
    {
      id: 't3',
      avatar: 'MM',
      name: t('home.testimonials.t3.name', 'Usuario verificado'),
      role: t('home.testimonials.t3.role', 'Comprador · AgroMarket'),
      content: t('home.testimonials.t3.content', 'Tener trazabilidad, reseñas y seguimiento en tiempo real cambia por completo la experiencia de compra.')
    }
  ];

  return (
    <div className="home-root">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              {t('home.heroBadge', '🌿 ASAFRUT · Chigorodó, Urabá')}
            </div>
            <h1 className="hero-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              {t('home.heroTitle', 'Del campo de Urabá directamente a tu mesa.')}
            </h1>
            <p className="hero-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              {t('home.heroSub', 'Conectamos productores agrícolas con compradores, eliminando intermediarios. Frutas frescas, precios justos, trazabilidad total.')}
            </p>

            <div className="hero-bullets animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('home.bullet1', 'Más de 50 productores activos en Urabá')}
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('home.bullet2', 'Pagos seguros con PSE y tarjeta')}
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                {t('home.bullet3', 'Seguimiento en tiempo real de tu pedido')}
              </div>
            </div>

            <div className="hero-btns animate-fade-up" style={{ transitionDelay: '0.4s' }} id="heroBtns">
              <Link to="/catalogo" className="btn btn-primary btn-lg">
                {t('home.viewCatalog', 'Ver catálogo →')}
              </Link>
              {!user && (
                <Link to="/registro" className="btn btn-secondary btn-lg">
                  {t('home.iAmProducer', 'Soy productor')}
                </Link>
              )}
            </div>

            <div className="hero-avatars animate-fade-up" style={{ transitionDelay: '0.5s' }}>
              <div className="avatar-group">
                <div className="avatar">AS</div>
                <div className="avatar">AG</div>
                <div className="avatar">PM</div>
                <div className="avatar">UR</div>
              </div>
              <div className="hero-avatars-text">
                {t('home.avatarsText', 'Un mercado agrícola vivo, conectado con datos reales')}
              </div>
            </div>
          </div>

          <div className="hero-right animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=900"
                alt="Frutas frescas"
                className="hero-img"
              />
            </div>
            <div className="float-card float-card-1">
              <div className="float-card-1-title">{t('home.floatCard1.title', '🚚 Pedido en camino')}</div>
              <div className="float-card-1-sub">{t('home.floatCard1.desc', 'Banano Premium · 50 kg')}</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
            <div className="float-card float-card-2">
              <div className="float-card-2-val">{t('home.floatCard2.val', '⭐ 4.9')}</div>
              <div className="float-card-2-sub">{t('home.floatCard2.desc', 'Calificación promedio')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="metrics">
        <div className="metrics-grid">
          <div className="metric-item animate-fade-up">
            <div className="metric-val" id="metricProductos">{metrics.productos}</div>
            <div className="metric-label">{t('home.metrics.published', 'Productos publicados')}</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            <div className="metric-val" id="metricProductores">{metrics.productores}</div>
            <div className="metric-label">{t('home.metrics.producers', 'Productores visibles')}</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <div className="metric-val" id="metricPrecio">{metrics.precio}</div>
            <div className="metric-label">{t('home.metrics.avgPrice', 'Precio promedio del catálogo')}</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="metric-val" id="metricCalificacion">{metrics.calificacion}</div>
            <div className="metric-label">{t('home.metrics.avgRating', 'Calificación promedio real')}</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="como-funciona">
        <div className="section-eyebrow animate-fade-up">{t('home.how.eyebrow', 'PROCESO')}</div>
        <h2 className="section-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
          {t('home.how.title', 'Tan fácil como 3 pasos')}
        </h2>
        <p className="section-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
          {t('home.how.sub', 'Comprar directo al productor nunca fue tan sencillo y seguro.')}
        </p>

        <div className="steps-grid">
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">01</div>
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h3 className="step-title">{t('home.how.step1.title', 'Crea tu cuenta')}</h3>
            <p className="step-desc">
              {t('home.how.step1.desc', 'Regístrate en menos de un minuto como comprador o productor y accede a la plataforma.')}
            </p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.4s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">02</div>
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <h3 className="step-title">{t('home.how.step2.title', 'Encuentra tus frutas')}</h3>
            <p className="step-desc">
              {t('home.how.step2.desc', 'Navega el catálogo, filtra por tipo, precio y disponibilidad para encontrar lo que necesitas.')}
            </p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.5s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">03</div>
              <svg viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
            <h3 className="step-title">{t('home.how.step3.title', 'Recibe en casa')}</h3>
            <p className="step-desc">
              {t('home.how.step3.desc', 'Paga de forma segura y rastrea tu pedido en tiempo real hasta que llegue a tu puerta.')}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
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
          {(productos.length === 0 ? PLACEHOLDER_PRODUCTS : productos).slice(0, 4).map((p, i) => {
            const hasStock = (p.stock !== undefined ? p.stock : p.cantidadDisponible) > 0;
            const price = p.precio;
            const producer = p.productor || p.nombreProductor || p.productorNombre || 'Productor';
            const rating = p.calificacion || p.calificacionPromedio || '4.8';
            return (
              <div key={p.id || i} className="product-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
                <img
                  src={p.imagenUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                  alt={p.nombre}
                  className="product-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';
                  }}
                />
                <div className="product-info">
                  <h3 className="product-name">{p.nombre}</h3>
                  <div className="product-producer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {producer}
                  </div>
                  <div className="product-price">${Number(price).toLocaleString('es-CO')}/kg</div>
                  <div className="product-meta">
                    <div className="product-rating">
                      ★ {rating}
                    </div>
                    <div className="product-badge">
                      {hasStock ? t('home.featured.available', 'Disponible') : t('home.featured.soldOut', 'Sin stock')}
                    </div>
                  </div>
                  <Link to="/catalogo" className="btn btn-primary product-btn">
                    {t('home.featured.orderNow', 'Pedir ahora')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOR PRODUCERS */}
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
                t('home.forProducers.feature1', 'Publica tus productos en minutos'),
                t('home.forProducers.feature2', 'Recibe pagos seguros directamente'),
                t('home.forProducers.feature3', 'Gestiona tus pedidos desde el panel'),
                t('home.forProducers.feature4', 'Comunícate con compradores en tiempo real'),
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
                alt="Productor agrícola"
                className="fp-img"
              />
            </div>
            <div className="fp-float">
              <div className="fp-float-title">{t('home.fpFloat.title', '📦 Nuevo pedido recibido')}</div>
              <div className="fp-float-desc">{t('home.fpFloat.desc', 'Detalles del pedido')}</div>
              <div className="fp-float-badge">{t('home.fpFloat.badge', 'Pendiente')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonios">
        <div className="test-header animate-fade-up">
          <div className="section-eyebrow">{t('home.testimonials.eyebrow', 'TESTIMONIOS')}</div>
          <h2 className="section-title">{t('home.testimonials.title', 'Lo que dicen nuestros usuarios')}</h2>
        </div>

        <div className="test-grid">
          {(resenas.length === 0 ? STATIC_TESTIMONIALS : resenas.slice(0, 3)).map((item, i) => {
            const avatar = item.avatar || (item.compradorNombre || 'C').substring(0, 2).toUpperCase();
            const name = item.name || item.compradorNombre || 'Usuario verificado';
            const role = item.role || (item.productoNombre ? `${t('home.testimonials.buyer', 'Comprador')} · ${item.productoNombre}` : t('home.testimonials.buyer', 'Comprador'));
            const content = item.content || item.comentario;
            const calificacion = item.calificacion || 5;
            return (
              <div key={item.id || i} className="test-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
                <div className="test-quote-mark">"</div>
                <div className="test-stars">{"★".repeat(calificacion)}</div>
                <div className="test-content">{content}</div>
                <div className="test-author">
                  <div className="test-avatar">{avatar}</div>
                  <div>
                    <div className="test-name">{name}</div>
                    <div className="test-role">{role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-overlay"></div>
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

      {/* FOOTER */}
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
            <div className="social-links">
              <a href="#"><svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z" /></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg></a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">{t('home.footer.platform', 'Plataforma')}</h3>
            <div className="footer-links">
              <Link to="/catalogo">{t('nav.catalog', 'Catálogo')}</Link>
              <a href="#como-funciona">{t('nav.howItWorks', 'Cómo funciona')}</a>
              <a href="#asafrut">{t('nav.about', 'Sobre ASAFRUT')}</a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">{t('home.footer.access', 'Acceso')}</h3>
            <div className="footer-links">
              <Link to="/login">{t('nav.login', 'Iniciar sesión')}</Link>
              <Link to="/registro">{t('nav.register', 'Registrarse')}</Link>
              <Link to="/login">{t('home.footer.producerPanel', 'Panel productor')}</Link>
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
          © 2026 AgroMarket · ASAFRUT · {t('home.footer.rights', 'Todos los derechos reservados')} · Desarrollado por Deyner Chaverra
        </div>
      </footer>
    </div>
  );
}
