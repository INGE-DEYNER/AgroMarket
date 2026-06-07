import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Index from './pages/Index';
import Catalogo from './pages/Catalogo';
import DashboardComprador from './pages/DashboardComprador';
import DashboardProductor from './pages/DashboardProductor';
import Perfil from './pages/Perfil';
import VerificarCorreo from './pages/VerificarCorreo';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';
import Admin from './pages/Admin';
import Envios from './pages/Envios';
import Pedidos from './pages/Pedidos';
import Resenas from './pages/Resenas';
import TestApi from './pages/TestApi';
import Mensajeria from './pages/Mensajeria';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="/dashboard-comprador" element={
            <ProtectedRoute roles={['COMPRADOR']}><DashboardComprador /></ProtectedRoute>
          } />
          <Route path="/dashboard-productor" element={
            <ProtectedRoute roles={['PRODUCTOR']}><DashboardProductor /></ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute><Perfil /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}><Admin /></ProtectedRoute>
          } />
          <Route path="/envios" element={
            <ProtectedRoute roles={['PRODUCTOR', 'ADMIN']}><Envios /></ProtectedRoute>
          } />
          <Route path="/pedidos" element={
            <ProtectedRoute roles={['COMPRADOR', 'PRODUCTOR', 'ADMIN']}><Pedidos /></ProtectedRoute>
          } />
          <Route path="/resenas" element={
            <ProtectedRoute roles={['COMPRADOR', 'PRODUCTOR']}><Resenas /></ProtectedRoute>
          } />
          <Route path="/test-api" element={
            <ProtectedRoute roles={['ADMIN']}><TestApi /></ProtectedRoute>
          } />
          <Route path="/mensajeria" element={
            <ProtectedRoute><Mensajeria /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}