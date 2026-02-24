import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";


const MatchNutricionista: React.FC = () => {
  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block"/>
      <img src="" alt="" />
      <p>Estamos buscando</p>
    </AuthLayout>
  );
};

export default MatchNutricionista;