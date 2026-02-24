import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import animation from "../assets/NUTRIUM-Animacion.gif"


const MatchNutricionista: React.FC = () => {
  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={animation} alt="animation" className="w-[80%] mx-auto block mb-10"/>
      <p className="px-3 text-center">Estamos buscando tu perfil para que los pacientes puedan encontrarte ...</p>
    </AuthLayout>
  );
};

export default MatchNutricionista;