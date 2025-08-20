import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/Home";

// Rutas para Cliente Empresa
import AgregarClienteEmpresa from "./pages/Cliente Empresa/agregar-cliente-empresa";
import EditarClienteEmpresa from "./pages/Cliente Empresa/editar-cliente-empresa";
import GestionarClienteEmpresa from "./pages/Cliente Empresa/GestionarClienteEmpresa";
import GestionarOficinasClienteEmpresa from "./pages/Cliente Empresa/GestionarOficinasClienteEmpresa";
import AgregarOficina from "./pages/Cliente Empresa/agregar-oficina";
import EditarOficina from "./pages/Cliente Empresa/editar-oficina";

// Rutas para Usuarios
import GestionarUsuarios from "./pages/Usuarios/GestionarUsuarios";
import AgregarUsuario from "./pages/Usuarios/AgregarUsuario";
import EditarUsuario from "./pages/Usuarios/EditarUsuario";

// Rutas para Roles y Permisos
import GestionRolesPermisos from "./pages/Roles y Permisos/GestionRolesPermisos";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        
        {/* Rutas para Cliente Empresa */}
        <Route path="/gestionar-cliente-empresa" element={<ProtectedRoute><GestionarClienteEmpresa /></ProtectedRoute>} />
        <Route path="/gestionar-cliente-empresa/agregar-cliente-empresa" element={<ProtectedRoute><AgregarClienteEmpresa /></ProtectedRoute>} />
        <Route path="/gestionar-cliente-empresa/editar-cliente-empresa/:id" element={<ProtectedRoute><EditarClienteEmpresa /></ProtectedRoute>} />
        <Route path="/gestionar-cliente-empresa/gestionar-oficinas/:clientId" element={<ProtectedRoute><GestionarOficinasClienteEmpresa /></ProtectedRoute>} />
        <Route path="/gestionar-cliente-empresa/gestionar-oficinas/:clientId/agregar-oficina" element={<ProtectedRoute><AgregarOficina /></ProtectedRoute>} />
        <Route path="/gestionar-cliente-empresa/gestionar-oficinas/:clientId/editar-oficina/:officeId" element={<ProtectedRoute><EditarOficina /></ProtectedRoute>} />

        {/* Rutas para Usuarios */}
        <Route path="/gestionar-usuarios" element={<ProtectedRoute><GestionarUsuarios /></ProtectedRoute>} />
        <Route path="/gestionar-usuarios/agregar-usuario" element={<ProtectedRoute><AgregarUsuario /></ProtectedRoute>} />
        <Route path="/gestionar-usuarios/editar-usuario/:id" element={<ProtectedRoute><EditarUsuario /></ProtectedRoute>} />

        {/* Rutas para Roles y Permisos */}
        <Route path="/gestionar-roles-permisos" element={<ProtectedRoute><GestionRolesPermisos /></ProtectedRoute>} />


        {/* Rutas para Administrador */}
        <Route path="/reportes/ventas" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/reportes/clientes" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/reportes/usuarios" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Rutas para Agente */}
        <Route path="/agente/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/agente/casos" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/agente/estadisticas" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/clientes/asignados" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/clientes/historial" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/casos/activos" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/casos/nuevo" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/casos/cerrados" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Rutas para Comercial */}
        <Route path="/comercial/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/comercial/ventas" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/comercial/objetivos" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/prospectos/lista" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/prospectos/nuevo" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/prospectos/seguimiento" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/ventas/activas" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/ventas/historial" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/ventas/estadisticas" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;