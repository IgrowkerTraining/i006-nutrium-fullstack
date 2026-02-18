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
import AuthLayout from "../components/layout/AuthLayout";


export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<AuthLayout />}>
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
      </Route>
      {/* Rutas privadas */}
      {/* FALTA AÑADIR <ProtectedRoute> */}
      <Route element={<AppLayout />}>
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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
