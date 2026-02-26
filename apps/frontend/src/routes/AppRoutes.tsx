import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { useAuth } from "../hooks/useAuth";

import LandingAcceso from "../pages/LandingAcceso";
import TerminosYCondiciones from "../pages/TerminosYCondiciones";
import Login from "../pages/Login";
import Register from "../pages/Register";

import RegisterNutritionistPersonal from "../pages/register/RegisterNutritionistPersonal";
import RegisterNutritionistProfessional from "../pages/register/RegisterNutritionistProfessional";
import RegisterPatientPersonal from "../pages/register/RegisterPatientPersonal";
import RegisterPatientHealth from "../pages/register/RegisterPatientHealth";
import RegisterPhoto from "../pages/register/RegisterPhoto";
import RegisterConfirm from "../pages/register/RegisterConfirm";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import CuestionarioPersonal from "../pages/CuestionarioPersonal";
import CuestionarioSalud from "../pages/CuestionarioSalud";
import MatchPaciente from "../pages/onboarding/MatchPaciente";
import MatchNutricionista from "../pages/onboarding/MatchNutricionista";
import Perfil from "../pages/Perfil";
import Calendario from "../pages/Calendario";
import RecuperarPassword from "../pages/RecuperarPassword";
import HomePage from "../pages/HomePage";
import MatchNutriList from "../pages/MatchNutriList";
import MatchPacienteList from "../pages/MatchPacienteList";


const MatchIndexRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "nutritionist" ? (
    <Navigate to="/match/paciente-list" replace />
  ) : (
    <Navigate to="/match/nutri-list" replace />
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route 
      path="/home-page" 
      element={
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      } 
      />
      <Route path="/landing-acceso" element={<LandingAcceso />} />
      <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />

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

            {/* register por rol */}
      <Route
        path="/register/nutritionist/personal"
        element={
          <PublicRoute>
            <RegisterNutritionistPersonal />
          </PublicRoute>
        }
      />

      <Route
        path="/register/nutritionist/professional"
        element={
          <PublicRoute>
            <RegisterNutritionistProfessional />
          </PublicRoute>
        }
      />
      
      <Route
        path="/register/photo"
        element={
          <PublicRoute>
            <RegisterPhoto />
          </PublicRoute>
        }
      />

      <Route
        path="/register/confirm"
        element={
          <PublicRoute>
            <RegisterConfirm />
          </PublicRoute>
        }
      />

      <Route
        path="/register/patient/personal"
        element={
          <PublicRoute>
            <RegisterPatientPersonal />
          </PublicRoute>
        }
      />

      <Route
        path="/register/patient/health"
        element={
          <PublicRoute>
            <RegisterPatientHealth />
          </PublicRoute>
        }
      />

      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/landing-acceso" element={<LandingAcceso />} />
      <Route path="/match-paciente" element={<MatchPaciente />} />
      <Route path="/match-nutricionista" element={<MatchNutricionista />} />
      <Route path="/match/nutri-list" element={<MatchNutriList />} />
      <Route path="/match/paciente-list" element={<MatchPacienteList />} />


      {/* privadas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/match" element={<MatchIndexRedirect />} />
        <Route path="/cuestionario-personal" element={<CuestionarioPersonal />} />
        <Route path="/cuestionario-salud" element={<CuestionarioSalud />} />
      </Route>

      <Route path="*" element={<Navigate to="/landing-acceso" replace />} />

    </Routes>
  );
};

export default AppRoutes;