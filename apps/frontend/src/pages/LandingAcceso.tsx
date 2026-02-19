import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";


const LandingAcceso: React.FC = () => {
  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" />
    </AuthLayout>
  );
};

export default LandingAcceso;