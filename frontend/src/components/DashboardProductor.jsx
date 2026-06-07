// File: frontend/src/components/DashboardProductor.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import { badgeEstado, formatearPrecio, showToast } from '../utils/ui.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const TIPO_MAP = {
  BANANO: 'Banano', MANGO: 'Mango', PINA: 'Piña', MARACUYA: 'Maracuyá',
  GUANABANA: 'Guanábana', NARANJA: 'Naranja', COCO: 'Coco', LIMON: 'Limón', OTRO: 'Otro',
};
const TIPOS = Object.keys(TIPO_MAP);

function normalizarTipo(tipo) {
  const value = String(tipo || '').toUpperCase().replace('Ñ', 'N').replace('Á', 'A').replace('É', 'E').replace('Ó', 'O').replace('Ú', 'U');
  return ['BANANO','MANGO','PINA','MARACUYA','GUANABANA','NARANJA','COCO','LIMON'].includes(value) ? value : 'OTRO';
}

function BadgeEstado({ estado }) {
  const { label, bg, fg } = badgeEstado(estado);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '999px', background: bg, color: fg, fontSize: '.78rem', fontWeight: 700 }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ProductoModal({ producto, onClose, onSaved }) {
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [desc, setDesc] = useState(producto?.descripcion || '');
  const [precio, setPrecio] = useState(producto?.precio || '');
  const [stock, setStock] = useState(producto?.cantidadDisponible || '');
  const [tipo, setTipo] = useState(TIPO_MAP[producto?.tipoFruta] || 'Banano');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(producto?.imagenUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const valid = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    if (!valid) { showToast('Solo JPG, PNG o WEBP.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('La imagen no puede superar 5 MB.', 'error'); return; }
    setImagenFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagenPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const guardar = async () => {
    if (!nombre || !precio || !stock) { showToast('Completa los campos obligatorios.', 'error'); return; }
    setUploading(true);
    const payload = {
      nombre: nombre.trim(), descripcion: desc.trim(),
      precio: Number(precio), cantidadDisponible: Number(stock),
      tipoFruta: normalizarTipo(tipo), enPromocion: false,
      imagenUrl: producto?.imagenUrl || '',
    };
    try {
      let productoId = producto?.id;
      if (productoId) {
        await api.actualizarProducto(productoId, payload);
        showToast('Producto actualizado.', 'success');
      } else {
        const res = await api.crearProducto(payload);
        productoId = res?.id;
        showToast('Producto publicado.', 'success');
      }
      if (imagenFile && productoId) {
        try { await api.subirImagenProducto(productoId, imagenFile); } catch (err) { console.warn('Error subiendo imagen:', err.message); }
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(err?.message || 'No se pudo guardar el producto.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '500px', width: '100%', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontWeight: 800 }}>{producto ? 'Editar producto' : 'Publicar nuevo producto'}</h3>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '1.4rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            { label: 'Nombre *', value: nombre, setter: setNombre, type: 'text', placeholder: 'Banano de Urabá' },
            { label: 'Precio (COP/kg) *', value: precio, setter: setPrecio, type: 'number', placeholder: '3500' },
            { label: 'Stock (kg) *', value: stock, setter: setStock, type: 'number', placeholder: '100' },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                placeholder={f.placeholder}
                onChange={(e) => f.setter(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Tipo de fruta</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', background: '#fff' }}>
              {Object.values(TIPO_MAP).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Descripción</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Describe tu producto..." style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(45,106,79,.2)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {/* Image upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Imagen del producto</label>
            {imagenPreview && (
              <img src={imagenPreview} alt="preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }} />
            )}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
              style={{
                border: '2px dashed rgba(45,106,79,.3)', borderRadius: '10px', padding: '20px',
                textAlign: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '0.9rem',
              }}
            >
              Arrastra una imagen o <span style={{ color: '#2d6a4f', fontWeight: 700 }}>selecciona un archivo</span>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>JPG, PNG o WEBP · Máx. 5 MB</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={uploading} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={uploading} style={{ padding: '10px 20px', borderRadius: '10px', border: 0, background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            {uploading ? 'Guardando...' : (producto ? 'Actualizar' : 'Publicar')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardProductorContent() {
  const { user } = useAuth();
  const [section, setSection] = useState('overview');
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { producto: null | object }

  const firstName = (user?.nombre || 'Usuario').split(' ').filter(Boolean)[0] || 'Usuario';

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodResp, ventasResp] = await Promise.all([
        api.getMisProductos(),
        api.getMisVentas(),
      ]);
      setProductos(prodResp?.content || prodResp || []);
      setVentas(ventasResp || []);
    } catch (err) {
      showToast(err?.message || 'No se pudo cargar el panel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    try {
      await api.eliminarProducto(id);
      setProductos((prev) => prev.filter((p) => String(p.id) !== String(id)));
      showToast('Producto eliminado.', 'success');
    } catch (err) {
      showToast(err?.message || 'No se pudo eliminar.', 'error');
    }
  };

  const avanzarPedido = async (id) => {
    try {
      await api.avanzarPedido(id);
      showToast('Estado del pedido actualizado.', 'success');
      const ventasResp = await api.getMisVentas();
      setVentas(ventasResp || []);
    } catch (err) {
      showToast(err?.message || 'No se pudo actualizar el pedido.', 'error');
    }
  };

  const activeProducts = productos.filter((p) => p.activo).length;
  const totalRevenue = ventas.filter((v) => String(v.estado).toUpperCase() !== 'CANCELADO').reduce((sum, v) => sum + Number(v.total || 0), 0);

  const navItems = [
    { id: 'overview', icon: '🏠', label: 'Inicio' },
    { id: 'productos', icon: '📦', label: 'Mis Productos' },
    { id: 'ventas', icon: '🧾', label: 'Ventas' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8faf8' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid rgba(45,106,79,.12)', display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#2d6a4f,#40916c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
            {(user?.nombre || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: '0.95rem' }}>{user?.nombre || 'Usuario'}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Productor</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => setSection(item.id)}
              style={{ padding: '10px 14px', borderRadius: '12px', border: 0, background: section === item.id ? 'rgba(45,106,79,.1)' : 'transparent', color: section === item.id ? '#2d6a4f' : '#374151', fontWeight: section === item.id ? 700 : 500, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <button type="button" onClick={() => setModal({ producto: null })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
            ＋ Nuevo producto
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {section === 'overview' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#1a3a2a' }}>¡Excelente día, {firstName}! 👨‍🌾</h1>
              <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <StatCard label="Productos activos" value={String(activeProducts).padStart(2, '0')} icon="🌱" />
              <StatCard label="Total ventas" value={String(ventas.length).padStart(2, '0')} icon="🧾" />
              <StatCard label="Ingresos totales" value={formatearPrecio(totalRevenue)} icon="💰" />
            </div>

            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Ventas recientes</h2>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8faf8' }}>
                  {['Pedido', 'Comprador', 'Total', 'Estado'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {ventas.slice(0, 5).map((v) => (
                    <tr key={v.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>#{v.id}</td>
                      <td style={{ padding: '12px 16px' }}>{v.compradorNombre || 'Cliente'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatearPrecio(v.total)}</td>
                      <td style={{ padding: '12px 16px' }}><BadgeEstado estado={v.estado} /></td>
                    </tr>
                  ))}
                  {ventas.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aún no registras ninguna venta.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'productos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1a3a2a' }}>Mis Productos</h1>
              <button type="button" onClick={() => setModal({ producto: null })}
                style={{ padding: '10px 20px', borderRadius: '12px', border: 0, background: '#2d6a4f', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                ＋ Nuevo producto
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8faf8' }}>
                  {['Producto', 'Tipo', 'Precio/kg', 'Stock', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={p.imagenUrl || 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80'} alt={p.nombre}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80'; }}
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                          <strong>{p.nombre}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{TIPO_MAP[p.tipoFruta] || p.tipoFruta}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatearPrecio(p.precio)}</td>
                      <td style={{ padding: '12px 16px' }}>{p.cantidadDisponible} kg</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '999px', background: p.activo ? '#d1fae5' : '#fee2e2', color: p.activo ? '#166534' : '#991b1b', fontSize: '0.78rem', fontWeight: 700 }}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => setModal({ producto: p })} style={{ padding: '4px 10px', borderRadius: '8px', border: 0, background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>✏️</button>
                        <button type="button" onClick={() => eliminarProducto(p.id)} style={{ padding: '4px 10px', borderRadius: '8px', border: 0, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                  {productos.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No tienes productos publicados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {section === 'ventas' && (
          <>
            <h1 style={{ margin: '0 0 24px', fontSize: '1.4rem', fontWeight: 800, color: '#1a3a2a' }}>Historial de Ventas</h1>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(45,106,79,.12)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8faf8' }}>
                  {['ID', 'Producto', 'Comprador', 'Cant.', 'Total', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {ventas.map((v) => {
                    const estado = String(v.estado).toUpperCase();
                    const canDespachar = estado === 'PENDIENTE' || estado === 'CONFIRMADO';
                    const canEntregar = estado === 'ENVIADO' || estado === 'PREPARANDO' || estado === 'EN_CAMINO';
                    return (
                      <tr key={v.id} style={{ borderTop: '1px solid rgba(45,106,79,.08)' }}>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontWeight: 600 }}>#{v.id}</td>
                        <td style={{ padding: '12px 16px' }}>{v.productoNombre || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>{v.compradorNombre || 'Cliente'}</td>
                        <td style={{ padding: '12px 16px' }}>{v.cantidad} kg</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{formatearPrecio(v.total)}</td>
                        <td style={{ padding: '12px 16px' }}><BadgeEstado estado={v.estado} /></td>
                        <td style={{ padding: '12px 16px' }}>
                          {canDespachar && <button type="button" onClick={() => avanzarPedido(v.id)} style={{ padding: '4px 10px', borderRadius: '8px', border: 0, background: '#2d6a4f', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Despachar</button>}
                          {canEntregar && <button type="button" onClick={() => avanzarPedido(v.id)} style={{ padding: '4px 10px', borderRadius: '8px', border: 0, background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Entregado</button>}
                          {!canDespachar && !canEntregar && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Completado</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {ventas.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Aún no tienes ventas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {modal && (
        <ProductoModal
          producto={modal.producto}
          onClose={() => setModal(null)}
          onSaved={cargarDatos}
        />
      )}
    </div>
  );
}

export default function DashboardProductor() {
  return (
    <>
      <Navbar />
      <ProtectedRoute allowedRoles={['productor', 'admin']}>
        <DashboardProductorContent />
      </ProtectedRoute>
    </>
  );
}
