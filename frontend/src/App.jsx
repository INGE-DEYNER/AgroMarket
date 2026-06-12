import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import VerificarCorreo from './pages/VerificarCorreo';
import RecuperarContrasena from './pages/RecuperarContrasena';
import RestablecerContrasena from './pages/RestablecerContrasena';

import Catalogo from './pages/Catalogo';
import DashboardComprador from './pages/DashboardComprador';
import DashboardProductor from './pages/DashboardProductor';
import Admin from './pages/Admin';
import Pedidos from './pages/Pedidos';
import Envios from './pages/Envios';
import Mensajeria from './pages/Mensajeria';
import Resenas from './pages/Resenas';
import Perfil from './pages/Perfil';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
          <Route path="/catalogo" element={<Catalogo />} />

          {/* Protegidas Generales */}
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
          <Route path="/envios" element={<ProtectedRoute><Envios /></ProtectedRoute>} />
          <Route path="/mensajeria" element={<ProtectedRoute><Mensajeria /></ProtectedRoute>} />
          <Route path="/resenas" element={<ProtectedRoute><Resenas /></ProtectedRoute>} />

          {/* Dashboards por Rol */}
          <Route
            path="/dashboard-comprador"
            element={
              <ProtectedRoute roles={['COMPRADOR', 'ADMIN', 'PRODUCTOR']}>
                <DashboardComprador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-productor"
            element={
              <ProtectedRoute roles={['PRODUCTOR', 'ADMIN']}>
                <DashboardProductor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
