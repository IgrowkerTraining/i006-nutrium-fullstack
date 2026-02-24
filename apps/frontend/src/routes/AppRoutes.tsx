import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import LandingAcceso from "../pages/LandingAcceso";
import TerminosYCondiciones from "../pages/TerminosYCondiciones";
import Login from "../pages/Login";
import Register from "../pages/Register";

import RegisterNutritionistPersonal from "../pages/register/RegisterNutritionistPersonal";
import RegisterNutritionistProfessional from "../pages/register/RegisterNutritionistProfessional";
// import RegisterPatientPersonal from "../pages/register/RegisterPatientPersonal";
import RegisterPhoto from "../pages/register/RegisterPhoto";

import OnboardingPatient from "../pages/onboarding/OnboardingPatient";
import OnboardingNutritionist from "../pages/onboarding/OnboardingNutritionist";

import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import CuestionarioPersonal from "../pages/CuestionarioPersonal";
import CuestionarioSalud from "../pages/CuestionarioSalud";
import Match from "../pages/Match";
import Perfil from "../pages/Perfil";
import Calendario from "../pages/Calendario";
import RecuperarPassword from "../pages/RecuperarPassword";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* públicas */}
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

      {/* <Route
        path="/register/patient/personal"
        element={
          <PublicRoute>
            <RegisterPatientPersonal />
          </PublicRoute>
        }
      /> */}

      <Route
        path="/onboarding/patient"
        element={
          <PublicRoute>
            <OnboardingPatient />
          </PublicRoute>
        }
      />

      <Route
        path="/onboarding/nutritionist"
        element={
          <PublicRoute>
            <OnboardingNutritionist />
          </PublicRoute>
        }
      />

      <Route path="/recuperar-password" element={<RecuperarPassword />} />

      {/* privadas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cuestionario-personal" element={<CuestionarioPersonal />} />
        <Route path="/cuestionario-salud" element={<CuestionarioSalud />} />
        <Route path="/match" element={<Match />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/calendario" element={<Calendario />} />
      </Route>

      {/* default */}
      <Route path="/" element={<Navigate to="/landing-acceso" replace />} />
      <Route path="*" element={<Navigate to="/landing-acceso" replace />} />
    </Routes>
  );
};

export default AppRoutes;