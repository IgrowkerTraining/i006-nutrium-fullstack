import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import { Button } from "../components/common/Button";


const LandingAcceso: React.FC = () => {
  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block"/>
      <p className="text-2xl font-semibold text-center my-6">Desea ingresar como...</p>
      <Button className="w-full mb-5">Cliente</Button>
      <Button className="w-full">Nutricionista</Button>
    </AuthLayout>
  );
};

export default LandingAcceso;