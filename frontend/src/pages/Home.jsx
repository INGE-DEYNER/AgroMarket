import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';

export default function Home() {
  const { t } = useTranslation();

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
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              🌿 ASAFRUT · Chigorodó, Urabá
            </div>
            <h1 className="hero-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              Del campo de <span>Urabá</span> directamente a tu mesa.
            </h1>
            <p className="hero-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              Conectamos productores agrícolas con compradores, eliminando
              intermediarios. Frutas frescas, precios justos, trazabilidad total.
            </p>

            <div className="hero-bullets animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Más de 50 productores activos en Urabá
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Pagos seguros con PSE y tarjeta
              </div>
              <div className="hero-bullet">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Seguimiento en tiempo real de tu pedido
              </div>
            </div>

            <div className="hero-btns animate-fade-up" style={{ transitionDelay: '0.4s' }} id="heroBtns">
              <Link to="/catalogo" className="btn btn-primary btn-lg">Ver catálogo →</Link>
              <Link to="/registro" className="btn btn-secondary btn-lg">Soy productor</Link>
            </div>

            <div className="hero-avatars animate-fade-up" style={{ transitionDelay: '0.5s' }}>
              <div className="avatar-group">
                <div className="avatar">JC</div>
                <div className="avatar">AP</div>
                <div className="avatar">LR</div>
                <div className="avatar">MM</div>
              </div>
              <div className="hero-avatars-text">
                Más de 200 familias ya confían en nosotros
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
            <div className="metric-val">200+</div>
            <div className="metric-label">Familias productoras</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.1s' }}>
            <div className="metric-val">8</div>
            <div className="metric-label">Tipos de frutas disponibles</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.2s' }}>
            <div className="metric-val">4.8★</div>
            <div className="metric-label">Calificación promedio</div>
          </div>
          <div className="metric-item animate-fade-up" style={{ transitionDelay: '0.3s' }}>
            <div className="metric-val">100%</div>
            <div className="metric-label">Pagos seguros</div>
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
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h3 className="step-title">Crea tu cuenta</h3>
            <p className="step-desc">
              Regístrate en menos de un minuto como comprador o productor y accede a la plataforma.
            </p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.4s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">02</div>
              <svg viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
            <h3 className="step-title">Encuentra tus frutas</h3>
            <p className="step-desc">
              Navega el catálogo, filtra por tipo, precio y disponibilidad para encontrar lo que necesitas.
            </p>
          </div>
          <div className="step-card animate-fade-up" style={{ transitionDelay: '0.5s' }}>
            <div className="step-icon-wrap">
              <div className="step-num">03</div>
              <svg viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>
            <h3 className="step-title">Recibe en casa</h3>
            <p className="step-desc">
              Paga de forma segura y rastrea tu pedido en tiempo real hasta que llegue a tu puerta.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured">
        <div className="featured-header animate-fade-up">
          <div>
            <div className="section-eyebrow">DESTACADOS</div>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              Frutas de temporada
            </h2>
          </div>
          <Link to="/catalogo" className="btn btn-secondary">Ver catálogo completo →</Link>
        </div>

        <div className="products-grid">
          {[
            { name: 'Banano Urabá', producer: 'Luis Palacios', price: '$1.200/kg', rating: '4.8', img: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500', alt: 'Banano' },
            { name: 'Mango Tommy', producer: 'Luis Palacios', price: '$3.500/kg', rating: '4.7', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500', alt: 'Mango' },
            { name: 'Aguacate Hass', producer: 'Ana Córdoba', price: '$4.500/kg', rating: '4.9', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500', alt: 'Aguacate Hass' },
            { name: 'Piña Manzana', producer: 'Ana Córdoba', price: '$2.800/kg', rating: '4.5', img: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500', alt: 'Piña Manzana' },
          ].map((p, i) => (
            <div key={i} className="product-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
              <img src={p.img} alt={p.alt} className="product-img" />
              <div className="product-info">
                <h3 className="product-name">{p.name}</h3>
                <div className="product-producer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {p.producer}
                </div>
                <div className="product-price">{p.price}</div>
                <div className="product-meta">
                  <div className="product-rating">
                    ★★★★★
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>({p.rating})</span>
                  </div>
                  <div className="product-badge">Disponible</div>
                </div>
                <Link to="/catalogo" className="btn btn-primary product-btn">Pedir ahora</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOR PRODUCERS */}
      <section className="for-producers" id="asafrut">
        <div className="fp-content">
          <div className="fp-left">
            <div className="fp-badge animate-fade-up">PARA PRODUCTORES</div>
            <h2 className="fp-title animate-fade-up" style={{ transitionDelay: '0.1s' }}>
              Vende tus frutas directamente. Sin intermediarios.
            </h2>
            <p className="fp-sub animate-fade-up" style={{ transitionDelay: '0.2s' }}>
              Únete a la red de ASAFRUT y maximiza tus ganancias conectando directo con los compradores finales.
            </p>

            <div className="fp-list animate-fade-up" style={{ transitionDelay: '0.3s' }}>
              {['Publica tus productos en minutos', 'Recibe pagos seguros directamente', 'Gestiona tus pedidos desde el panel', 'Comunícate con compradores en tiempo real'].map((item, i) => (
                <div key={i} className="fp-item">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {item}
                </div>
              ))}
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
              <div className="fp-float-desc">Juan Calle · 50 kg de Banano</div>
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
          {[
            { initials: 'JC', name: 'Juan Calle', role: 'Comprador · Medellín', content: 'Compro banano para mi negocio cada semana. La calidad es constante y los precios son mucho mejores que en la central mayorista.' },
            { initials: 'AP', name: 'Andrés Palacios', role: 'Productor · Chigorodó', content: 'Antes vendía a intermediarios que me pagaban muy poco. Ahora con AgroMarket vendo directo y mis ingresos aumentaron un 40%.' },
            { initials: 'MM', name: 'María Mosquera', role: 'Productora · Apartadó', content: 'La plataforma es muy fácil de usar. Publico mis productos, recibo los pedidos y coordino las entregas todo desde el celular.' },
          ].map((t, i) => (
            <div key={i} className="test-card animate-fade-up" style={{ transitionDelay: `${0.1 * (i + 1)}s` }}>
              <div className="test-quote-mark">"</div>
              <div className="test-stars">★★★★★</div>
              <div className="test-content">{t.content}</div>
              <div className="test-author">
                <div className="test-avatar">{t.initials}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
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
              <svg viewBox="0 0 24 24" style={{ fill: 'var(--green-light)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21H5.71C6.66 19 7.66 17.13 9 16c3.95 2.85 8 2.5 12-1-1-2-2.4-4.5-4-7z" />
              </svg>
              AgroMarket
            </div>
            <p className="footer-desc">
              Plataforma oficial de comercialización para la Asociación de Agricultores ASAFRUT.
            </p>
            <div className="social-links">
              <a href="#"><svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z" /></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg></a>
            </div>
          </div>

          <div>
            <h3 className="footer-col-title">Plataforma</h3>
            <div className="footer-links">
              <Link to="/catalogo">Catálogo</Link>
              <a href="#como-funciona">Cómo funciona</a>
              <a href="#asafrut">Sobre ASAFRUT</a>
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
              <span>📧 contacto@agromarket.co</span>
              <span>📞 +57 310 000 0000</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 AgroMarket · ASAFRUT · Todos los derechos reservados
        </div>
      </footer>
    </>
  );
}
