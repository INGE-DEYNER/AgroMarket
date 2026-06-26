import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Productores() {
  const productoresMock = [
    {
      nombre: 'Carlos Mendoza',
      ubicacion: 'Vereda Guapa, Chigorodó',
      frutas: ['Banano Urabá', 'Plátano Hartón'],
      calificacion: 4.9,
      imagen: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400',
      experiencia: 'Más de 15 años cultivando en la región.'
    },
    {
      nombre: 'Elena Gómez',
      ubicacion: 'Sector La Hachita, Carepa',
      frutas: ['Maracuyá Amarillo', 'Guanábana'],
      calificacion: 4.8,
      imagen: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
      experiencia: 'Especialista en frutas tropicales orgánicas.'
    },
    {
      nombre: 'Manuel Torres',
      ubicacion: 'Vereda Sadem, Chigorodó',
      frutas: ['Coco Criollo', 'Limón Pajarito'],
      calificacion: 5.0,
      imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      experiencia: 'Proveedor líder de coco para la asociación ASAFRUT.'
    },
    {
      nombre: 'Sofía Restrepo',
      ubicacion: 'Finca La Ceiba, Apartadó',
      frutas: ['Papaya Melón', 'Mango de Hilacha'],
      calificacion: 4.7,
      imagen: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      experiencia: 'Comprometida con la agricultura sostenible y limpia.'
    }
  ];

  return (
    <div style={{ background: '#f9fbf9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'var(--primary-dark)', fontSize: '2.5rem', fontWeight: 'bold' }}>Nuestros Productores Aliados</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginTop: '10px' }}>
            Productores certificados de la región del Urabá Antioqueño que garantizan la máxima frescura del campo a tu mesa.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {productoresMock.map((p, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eef2ee', display: 'flex', flexDirection: 'column' }}>
              <img src={p.imagen} alt={p.nombre} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>⭐ {p.calificacion} · Productor Certificado</span>
                <h3 style={{ color: 'var(--text)', fontSize: '1.25rem', margin: '8px 0 4px 0' }}>{p.nombre}</h3>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '12px', display: 'block' }}>📍 {p.ubicacion}</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>{p.experiencia}</p>
                <div style={{ borderTop: '1px solid #f0f4f0', paddingTop: '12px' }}>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Cultivos Principales:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {p.frutas.map((f, i) => (
                      <span key={i} style={{ background: 'var(--green-bg)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
