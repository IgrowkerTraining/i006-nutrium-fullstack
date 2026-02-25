import React from "react";
import { Navigate } from "react-router-dom";

const Register: React.FC = () => {
  const role = localStorage.getItem("nutrium_role");

  if (!role) return <Navigate to="/landing-acceso" replace />;

  if (role === "nutritionist") {
    return <Navigate to="/register/nutritionist/personal" replace />;
  }

  if (role === "patient") {
    return <Navigate to="/register/patient/personal" replace />;
  }

  return <Navigate to="/landing-acceso" replace />;
};

export default Register;