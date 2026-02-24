import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import CuestionarioPersonal from "../pages/CuestionarioPersonal";
import CuestionarioSalud from "../pages/CuestionarioSalud";
import AppLayout from "../components/layout/AppLayout";
import Match from "../pages/Match";
import Perfil from "../pages/Perfil";
import Calendario from "../pages/Calendario";
import RecuperarPassword from "../pages/RecuperarPassword";
import LandingAcceso from "../pages/LandingAcceso";
import TerminosYCondiciones from "../pages/TerminosYCondiciones";




export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/landing-acceso" element={<LandingAcceso />} />
       <Route
        path="/terminos-y-condiciones"
        element={<TerminosYCondiciones />}/>

      {/* Rutas privadas */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
        }>
      <Route
        path="/cuestionario-personal"
        element={
            <CuestionarioPersonal />
        }
      />
      <Route
        path="/cuestionario-salud"
        element={
            <CuestionarioSalud />
        }
      />
      <Route
        path="/dashboard"
        element={
            <Dashboard />
        }
      />

      <Route path="/match" element={<Match />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/calendario" element={<Calendario />} />

      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
