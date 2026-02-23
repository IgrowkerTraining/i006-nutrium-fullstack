import React from "react";
import { Navigate } from "react-router-dom";

const RegisterPatient: React.FC = () => {
  return <Navigate to="/onboarding/patient" replace />;
};

export default RegisterPatient;