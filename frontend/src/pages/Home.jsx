import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import '../styles/home.css';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ productos: '—', productores: '—', precio: '—', calificacion: '—' });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [siteRegion, setSiteRegion] = useState('Urabá');
  const [siteName, setSiteName] = useState('AgroMarket');

  useEffect(() => {
    const loadSiteInfo = async () => {
      try {
        const res = await fetch('/api/public/site-info');
        if (res.ok) {
          const data = res.json().then(j => j?.data || j || {});
          const d = await data;
          if (d.siteName) setSiteName(d.siteName);
          if (d.siteRegion) setSiteRegion(d.siteRegion);
          if (d.contactEmail) {
            const el = document.getElementById('contactEmail');
            if (el) el.textContent = '📧 ' + d.contactEmail;
          }
          if (d.contactPhone) {
            const el = document.getElementById('contactPhone');
            if (el) el.textContent = '📞 ' + d.contactPhone;
          }
        }
      } catch (e) {
        const el1 = document.getElementById('contactEmail');
        const el2 = document.getElementById('contactPhone');
        if (el1) el1.style.display = 'none';
        if (el2) el2.style.display = 'none';
      }
    };
    loadSiteInfo();
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [prodRes, prodCountRes, priceRes, calRes] = await Promise.all([
          fetch('/api/public/productos?page=0&size=1'),
          fetch('/api/public/productores/count'),
          fetch('/api/public/catalogo/precio-promedio'),
          fetch('/api/public/catalogo/calificacion-promedio'),
        ]);
        let productos = '—', productores = '—', precio = '—', calificacion = '—';
        if (prodRes.ok) {
          const d = await prodRes.json();
          productos = d.totalElements || '—';
        }
        if (prodCountRes.ok) {
          const d = await prodCountRes.json();
          productores = d.count || d || '—';
        }
        if (priceRes.ok) {
          const d = await priceRes.json();
          precio = d.precio || '—';
        }
        if (calRes.ok) {
          const d = await calRes.json();
          calificacion = d.calificacion || '—';
        }
        setMetrics({ productos, productores, precio, calificacion });
      } catch (e) {
        // keep defaults
      }
    };
    loadMetrics();
  }, []);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await fetch('/api/public/productos?page=0&size=8');
        if (res.ok) {
          const d = await res.json();
          const items = d.content || d || [];
          setFeaturedProducts(items);
        }
      } catch (e) {
        // keep empty
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [featuredProducts]);

  return (
    <div className="home-root">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              🌿 <span data-site="siteName">{siteName}</span> · <span data-site="siteRegion">{siteRegion}</span>
            </div>
            <h1 className="hero-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              Del campo de <span data-site="siteRegion">{siteRegion}</span> directamente a tu mesa.
            </h1>
            <p className="hero-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              Conectamos productores agrícolas con compradores, eliminando intermediarios. Frutas frescas, precios justos, trazabilidad total.
            </p>

            <div className="hero-bullets animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Más de 50 productores activos en <span data-site="siteRegion">{siteRegion}</span>
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Pagos seguros con PSE y tarjeta
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Seguimiento en tiempo real de tu pedido
              </div>
            </div>

            <div className="hero-btns animate-fade-up" style={{ transitionDelay: '0.4s' }} id="heroBtns">
              <Link to="/catalogo" className="btn btn-primary btn-lg">Ver catálogo →</Link>
              {!user && (
                <Link to="/registro" className="btn btn-secondary btn-lg">Soy productor</Link>
              )}
            </div>

            <div className="hero-avatars animate-fade-up" style={{ transitionDelay: '0.5s' }}>
              <div className="avatar-group">
                <div className="avatar">AS</div>
                <div className="avatar">AG</div>
                <div className="avatar">PM</div>
                <div className="avatar">UR</div>
              </div>
              <div className="hero-avatars-text">Un mercado agrícola vivo, conectado con datos reales</div>
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
              <div className="float-card-1-title">🚚 Pedido en camino</div>
              <div className="float-card-1-sub">Banano Premium · 50 kg</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill"></div>
              </div>
            </div>
            <div className="float-card float-card-2">
              <div className="float-card-2-val">⭐ 4.9</div>
              <div className="float-card-2-sub">Calificación promedio</div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="metrics">
        <div className="metrics-grid">
          <div className="metric-item animate-fade-up">
            <div className="metric-val" id="metricProductos">{metrics.productos}</div>
            <div className="metric-label">Productos publicados</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            <div className="metric-val" id="metricProductores">{metrics.productores}</div>
            <div className="metric-label">Productores visibles</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <div className="metric-val" id="metricPrecio">{metrics.precio}</div>
            <div className="metric-label">Precio promedio del catálogo</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="metric-val" id="metricCalificacion">{metrics.calificacion}</div>
            <div className="metric-label">Calificación promedio real</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="como-funciona">
        <div className="section-eyebrow animate-fade-up">PROCESO</div>
        <h2 className="section-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
          Tan fácil como 3 pasos
        </h2>
        <p className="section-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
          Comprar directo al productor nunca fue tan sencillo y seguro.
        </p>

        <div className="steps-grid">
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">01</div>
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
            <h3 className="step-title">Crea tu cuenta</h3>
            <p className="step-desc">Regístrate en menos de un minuto como comprador o productor y accede a la plataforma.</p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.4s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">02</div>
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
            </div>
            <h3 className="step-title">Encuentra tus frutas</h3>
            <p className="step-desc">Navega el catálogo, filtra por tipo, precio y disponibilidad para encontrar lo que necesitas.</p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.5s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">03</div>
              <svg viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
            </div>
            <h3 className="step-title">Recibe en casa</h3>
            <p className="step-desc">Paga de forma segura y rastrea tu pedido en tiempo real hasta que llegue a tu puerta.</p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured">
        <div className="featured-header animate-fade-up">
          <div>
            <div className="section-eyebrow">DESTACADOS</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Frutas de temporada</h2>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver catálogo completo →</Link>
        </div>

        <div className="products-grid" id="featuredProducts">
          {featuredProducts.length === 0 && (
            <div key="fallback" id="homeMetricsFallback" style={{ gridColumn: '1 / -1' }}></div>
          )}
          {featuredProducts.map((p) => (
            <div key={p.id} className="product-mini-card">
              {p.enPromocion && <span className="badge-promo">Oferta</span>}
              <div className="product-mini-img">
                <img src={p.imagenUrl || 'https://placehold.co/400x300/e8f5e9/1a5c2a?text=' + p.nombre} alt={p.nombre} />
              </div>
              <div className="product-mini-body">
                <div className="product-mini-name">{p.nombre}</div>
                <div className="product-mini-price">${Number(p.precio).toLocaleString('es-CO')}/kg</div>
                <Link to="/catalogo" className="btn btn-secondary btn-sm" style={{ marginTop: '8px', width: '100%', textAlign: 'center' }}>Ver</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR PRODUCERS */}
      <section className="for-producers" id="for-producers">
        <div className="fp-content">
          <div className="fp-left">
            <div className="fp-badge animate-fade-up">PARA PRODUCTORES</div>
            <h2 className="fp-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              Vende tus frutas directamente. Sin intermediarios.
            </h2>
            <p className="fp-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              Únete a la red de productores y maximiza tus ganancias conectando directo con los compradores finales.
            </p>

            <div className="fp-list animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              <div className="fp-item">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Publica tus productos en minutos
              </div>
              <div className="fp-item">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Recibe pagos seguros directamente
              </div>
              <div className="fp-item">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Gestiona tus pedidos desde el panel
              </div>
              <div className="fp-item">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Comunícate con compradores en tiempo real
              </div>
            </div>

            <Link to="/registro" className="btn btn-white btn-lg animate-fade-up" style={{ transitionDelay: '0.4s' }}>
              Quiero ser productor
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
              <div className="fp-float-title">📦 Nuevo pedido recibido</div>
              <div className="fp-float-desc">Detalles del pedido</div>
              <div className="fp-float-badge">Pendiente</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="test-header animate-fade-up">
          <div className="section-eyebrow">TESTIMONIOS</div>
          <h2 className="section-title">Lo que dicen nuestros usuarios</h2>
        </div>

        <div className="test-grid">
          <div className="test-card animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            <div className="test-quote-mark">"</div>
            <div className="test-stars">★★★★★</div>
            <div className="test-content">
              La plataforma hace más claro el origen de lo que compro y me permite revisar el catálogo sin depender de intermediarios.
            </div>
            <div className="test-author">
              <div className="test-avatar">JC</div>
              <div>
                <div className="test-name">Cliente verificado</div>
                <div className="test-role">Comprador · <span data-site="siteRegion">{siteRegion}</span></div>
              </div>
            </div>
          </div>

          <div className="test-card animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <div className="test-quote-mark">"</div>
            <div className="test-stars">★★★★★</div>
            <div className="test-content">
              El panel centraliza pedidos, mensajes y envíos en un solo lugar, así el trabajo diario se vuelve más simple.
            </div>
            <div className="test-author">
              <div className="test-avatar">AP</div>
              <div>
                <div className="test-name">Productor verificado</div>
                <div className="test-role">Chigorodó</div>
              </div>
            </div>
          </div>

          <div className="test-card animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="test-quote-mark">"</div>
            <div className="test-stars">★★★★★</div>
            <div className="test-content">
              Tener trazabilidad, reseñas y seguimiento en tiempo real cambia por completo la experiencia de compra.
            </div>
            <div className="test-author">
              <div className="test-avatar">MM</div>
              <div>
                <div className="test-name">Usuario verificado</div>
                <div className="test-role">AgroMarket</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-overlay"></div>
        <div className="cta-content">
          <h2 className="cta-title animate-fade-up">¿Listo para empezar?</h2>
          <p className="cta-sub animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            Únete a AgroMarket y sé parte del comercio justo agrícola.
          </p>
          <div className="cta-btns animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <Link to="/catalogo" className="btn btn-white btn-lg">Explorar catálogo</Link>
            <Link to="/registro" className="btn btn-outline-white btn-lg">Registrarme gratis</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="nav-brand" style={{ color: '#fff', marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24" style={{ fill: 'var(--green-light)' }}><path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" /></svg>
              AgroMarket
            </div>
            <p className="footer-desc">Plataforma oficial de comercialización agrícola.</p>
            <div className="social-links">
              <a href="#"><svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z" /></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M2.004 22l1.352-4.968A9.926 9.926 0 0 1 2 11.99C2 6.47 6.48 2 12 2s10 4.47 10 9.99c0 5.51-4.48 9.99-10 9.99-1.74 0-3.37-.44-4.78-1.21L2.004 22zm5.72-3.15l.39.23c1.19.71 2.54 1.09 3.89 1.09 4.6 0 8.35-3.75 8.35-8.35S16.6 3.64 12 3.64 3.65 7.39 3.65 11.99c0 1.48.42 2.91 1.2 4.14l.25.4-1.12 4.11 4.22-1.14zm8.68-6.1c-.13-.22-.47-.35-1-.62s-3.11-1.53-3.6-1.7c-.48-.17-.83-.26-1.19.26-.35.53-1.37 1.7-1.68 2.05-.31.35-.62.4-1.14.13-1.92-.95-3.32-2.1-4.63-4.35-.14-.24-.02-.37.1-.5.11-.11.24-.29.36-.43.12-.15.17-.26.25-.44.09-.17.04-.33-.02-.45-.06-.13-1.18-2.85-1.62-3.9-.42-1.02-.85-.88-1.19-.9-.31-.02-.67-.02-1.03-.02-.36 0-.94.13-1.43.68-.49.54-1.87 1.83-1.87 4.46s1.92 5.17 2.19 5.53c.26.36 3.76 5.75 9.11 8.06 4.47 1.93 5.4 1.54 6.38 1.45 1.04-.1 3.11-1.27 3.55-2.5.44-1.22.44-2.28.31-2.5z" /></svg></a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Plataforma</h3>
            <div className="footer-links">
              <Link to="/catalogo">Catálogo</Link>
              <a href="#como-funciona">Cómo funciona</a>
              <a href="#for-producers">Sobre nosotros</a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Acceso</h3>
            <div className="footer-links">
              <Link to="/login">Iniciar sesión</Link>
              <Link to="/registro">Registrarse</Link>
              <Link to="/login">Panel productor</Link>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Contacto</h3>
            <div className="footer-contact">
              <span>📍 Chigorodó, Antioquia</span>
              <span id="contactEmail">📧 <span className="muted">Cargando...</span></span>
              <span id="contactPhone">📞 <span className="muted">Cargando...</span></span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 AgroMarket · Todos los derechos reservados · Desarollado por  Deyner Chaverra
        </div>
      </footer>
    </div>
  );
}
