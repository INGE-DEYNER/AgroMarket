// src/pages/Ayuda.jsx
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Ayuda() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'envios', label: 'Envíos' },
    { id: 'cuenta', label: 'Mi Cuenta' },
    { id: 'productores', label: 'Productores' }
  ];

  const faqs = [
    {
      category: 'pedidos',
      q: '¿Cómo hago seguimiento a mis pedidos?',
      a: 'Una vez confirmado tu pago, puedes dirigirte a "Mis Pedidos" en tu menú de usuario para ver el estado en tiempo real (Pendiente, Despachado, En camino, Entregado) y el número de guía de la transportadora.'
    },
    {
      category: 'pedidos',
      q: '¿Puedo cancelar un pedido realizado?',
      a: 'Sí, puedes solicitar la cancelación del pedido desde tu panel de comprador siempre y cuando el productor no lo haya despachado/marcado en camino. En ese caso, los fondos en fideicomiso te serán devueltos en su totalidad.'
    },
    {
      category: 'pagos',
      q: '¿Qué es el sistema de Fideicomiso Comercial (Escrow)?',
      a: 'Es un método seguro de pago donde retenemos los fondos del comprador en una cuenta intermedia protegida. Solo liberamos el dinero al productor cuando el comprador recibe y confirma la conformidad del producto fresco, evitando estafas y garantizando que recibas lo acordado.'
    },
    {
      category: 'pagos',
      q: '¿Qué métodos de pago simula la plataforma?',
      a: 'Simulamos pagos electrónicos rápidos mediante PSE (selector de bancos de Colombia), tarjeta de crédito/débito (Visa, Mastercard, AMEX), Daviplata y Nequi.'
    },
    {
      category: 'envios',
      q: '¿Cuánto tiempo tarda la entrega?',
      a: 'Los despachos se originan en Chigorodó, Urabá. Los envíos al mismo municipio toman 1 día; dentro del departamento de Antioquia 2 días; ciudades principales como Bogotá o Cali 3 días; y otras regiones hasta 4 días hábiles.'
    },
    {
      category: 'envios',
      q: '¿Cuáles son los costos de envío?',
      a: 'El costo de envío es variable y se calcula en base a la distancia y peso. AgroMarket te regala el costo de envío en tu primera compra registrándote con el cupón de bienvenida.'
    },
    {
      category: 'cuenta',
      q: '¿Cómo cambio mi divisa de preferencia?',
      a: 'Ve a "Mi cuenta" -> "Mi Perfil", selecciona tu divisa preferida (COP, USD, EUR) en el desplegable de preferencias y dale guardar. Los precios de los productos y transacciones se convertirán dinámicamente.'
    },
    {
      category: 'productores',
      q: '¿Cómo me registro para vender mis frutas?',
      a: 'Al registrarte en la plataforma, elige el Rol "Productor". Deberás completar tu perfil incluyendo información bancaria para transferencias, ubicación de la finca y cargar un documento de identidad para verificación por parte del administrador.'
    }
  ];

  const handleToggle = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openSupportChatbot = () => {
    const trigger = document.querySelector(".chatbot-trigger");
    if (trigger) trigger.click();
  };

  return (
    <div style={{ background: '#f6faf7', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      
      {/* Help Hero Search */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>Centro de Ayuda</h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '24px' }}>
            ¿Tienes alguna duda? Busca en nuestras preguntas frecuentes o escríbenos.
          </p>
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Busca por palabra clave (ej. fideicomiso, envío, pago)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '30px',
                border: 'none',
                outline: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                fontSize: '1rem',
                color: '#333'
              }}
            />
          </div>
        </div>
      </div>

      {/* FAQs Main area */}
      <div style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? '#2d6a4f' : 'white',
                color: activeCategory === cat.id ? 'white' : '#4a5568',
                padding: '8px 18px',
                borderRadius: '20px',
                border: activeCategory === cat.id ? '1px solid #2d6a4f' : '1px solid #e2e8f0',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#718096', fontStyle: 'italic' }}>
              No encontramos preguntas relacionadas con tu búsqueda. Intenta con otros términos.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(45,106,79,0.03)',
                  border: '1px solid #eef2ee',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                <button
                  onClick={() => handleToggle(index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#1b4332',
                    fontWeight: '600',
                    fontSize: '1.05rem'
                  }}
                >
                  <span>{faq.q}</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    fill="currentColor"
                    style={{
                      transform: expandedFaq === index ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </button>
                
                {expandedFaq === index && (
                  <div style={{
                    padding: '0 20px 20px 20px',
                    color: '#4a5568',
                    lineHeight: '1.6',
                    fontSize: '0.96rem',
                    borderTop: '1px solid #fcfdfc'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Support Call-to-action block */}
        <div style={{
          marginTop: '60px',
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid #eef2ee',
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1b4332', fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>¿Aún tienes dudas?</h3>
          <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '20px' }}>
            Nuestro equipo de soporte humano y asistente de IA están listos para orientarte.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={openSupportChatbot}
              style={{
                background: '#2d6a4f',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(45,106,79,0.2)'
              }}
            >
              Hablar con IA de Soporte
            </button>
            <a
              href="mailto:soporte@agro-market.app"
              style={{
                background: 'white',
                color: '#2d6a4f',
                border: '2px solid #2d6a4f',
                padding: '10px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                textDecoration: 'none'
              }}
            >
              Enviar Email a Soporte
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
