import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Login from './pages/Login';
import Registro from './pages/Registro';
import Catalogo from './pages/Catalogo';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import VerificarCorreo from './pages/VerificarCorreo';

// Páginas protegidas
import DashboardComprador from './pages/DashboardComprador';
import DashboardProductor from './pages/DashboardProductor';
import Perfil from './pages/Perfil';
import Envios from './pages/Envios';
import Mensajeria from './pages/Mensajeria';
import Pedidos from './pages/Pedidos';
import Resenas from './pages/Resenas';
import Admin from './pages/Admin';

// Home principal
import Home from './pages/Home';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz → redirigir a /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

          {/* Páginas protegidas */}
          <Route path="/dashboard-comprador" element={
            <ProtectedRoute><DashboardComprador /></ProtectedRoute>
          } />
          <Route path="/dashboard-productor" element={
            <ProtectedRoute><DashboardProductor /></ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute><Perfil /></ProtectedRoute>
          } />
          <Route path="/envios" element={
            <ProtectedRoute><Envios /></ProtectedRoute>
          } />
          <Route path="/mensajeria" element={
            <ProtectedRoute><Mensajeria /></ProtectedRoute>
          } />
          <Route path="/pedidos" element={
            <ProtectedRoute><Pedidos /></ProtectedRoute>
          } />
          <Route path="/resenas" element={
            <ProtectedRoute><Resenas /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><Admin /></ProtectedRoute>
          } />

          {/* Cualquier ruta no encontrada → home */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
