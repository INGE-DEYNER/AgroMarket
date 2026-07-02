import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function InfoLegal() {
  const location = useLocation();
  const path = location.pathname;

  const getContent = () => {
    if (path === '/terminos') {
      return {
        title: 'Términos de Uso',
        sub: 'Última actualización: Junio 2026',
        sections: [
          {
            title: '1. Aceptación de los Términos',
            content: 'Al acceder y utilizar la plataforma AgroMarket, usted acepta cumplir y estar sujeto a estos Términos de Uso. Si no está de acuerdo, por favor absténgase de usar el sitio.'
          },
          {
            title: '2. Registro y Cuentas',
            content: 'Para publicar productos como productor o realizar compras como comprador, debe registrarse y mantener información verídica, precisa y actualizada. Usted es responsable de la confidencialidad de su cuenta.'
          },
          {
            title: '3. Transacciones y Escrow (Fideicomiso)',
            content: 'AgroMarket actúa como intermediario seguro utilizando un sistema de fideicomiso. El pago del comprador se retiene de forma segura hasta que se confirma la entrega de los productos agrícolas, protegiendo a ambas partes.'
          },
          {
            title: '4. Moderación de Productos y Reseñas',
            content: 'Nos reservamos el derecho de moderar, editar o eliminar productos y reseñas que violen las políticas de la plataforma, contengan información falsa o afecten la integridad de la comunidad.'
          }
        ]
      };
    } else if (path === '/privacidad') {
      return {
        title: 'Política de Privacidad',
        sub: 'Última actualización: Junio 2026',
        sections: [
          {
            title: '1. Recopilación de Datos',
            content: 'Recopilamos información personal como nombre, correo electrónico, teléfono, ubicación y detalles de pago, necesaria para proveer los servicios de comercio agrícola en la región de Urabá.'
          },
          {
            title: '2. Uso de la Información',
            content: 'Utilizamos sus datos para procesar pedidos, gestionar la logística de envíos, habilitar el chat de soporte de IA, y asegurar el cumplimiento de las transacciones comerciales.'
          },
          {
            title: '3. Protección de Datos (Ley Habeas Data)',
            content: 'Cumplimos con la Ley 1581 de 2012 de Colombia. Sus datos personales no serán compartidos con terceros sin su consentimiento expreso, excepto cuando sea requerido por la ley para procesamiento de pagos.'
          },
          {
            title: '4. Sus Derechos',
            content: 'Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales almacenados en nuestras bases de datos en cualquier momento desde su perfil.'
          }
        ]
      };
    } else {
      return {
        title: 'Política de Cookies',
        sub: 'Última actualización: Junio 2026',
        sections: [
          {
            title: '1. ¿Qué son las Cookies?',
            content: 'Las cookies son pequeños archivos de texto que se almacenan en su navegador para optimizar la experiencia de usuario y recordar preferencias de sesión.'
          },
          {
            title: '2. Cookies Utilizadas',
            content: 'Utilizamos cookies técnicas obligatorias para el inicio de sesión (JWT) y el carrito de compras, así como cookies de análisis para entender el tráfico y rendimiento del catálogo de productos.'
          },
          {
            title: '3. Control de Cookies',
            content: 'Usted puede configurar su navegador para bloquear o alertarle sobre estas cookies, pero algunas partes de la plataforma podrían no funcionar correctamente.'
          }
        ]
      };
    }
  };

  const info = getContent();

  return (
    <div style={{ background: '#f9fbf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2ee' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.2rem', marginBottom: '10px' }}>{info.title}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '30px' }}>{info.sub}</p>
          
          <div style={{
            background: '#fcfdfc',
            border: '1px solid #e2ece2',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '32px',
          }}>
            <h4 style={{ color: 'var(--primary-dark)', fontSize: '1rem', marginBottom: '12px', fontWeight: '600' }}>Contenido de esta página:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {info.sections.map((sec, idx) => (
                <li key={idx}>
                  <a 
                    href={`#section-${idx}`}
                    style={{
                      color: '#2d6a4f',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={(e) => e.target.style.color = '#52b788'}
                    onMouseOut={(e) => e.target.style.color = '#2d6a4f'}
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {info.sections.map((sec, idx) => (
              <div key={idx} id={`section-${idx}`} style={{ borderBottom: '1px solid #f0f4f0', paddingBottom: '20px', scrollMarginTop: '100px' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '8px' }}>{sec.title}</h3>
                <p style={{ color: 'var(--text)', lineHeight: '1.6', fontSize: '0.95rem' }}>{sec.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
