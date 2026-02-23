import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import { Button } from "../components/common/Button";

const LandingAcceso: React.FC = () => {
  const navigate = useNavigate();

  const setRoleAndGo = (role: "patient" | "nutritionist") => {
    localStorage.setItem("nutrium_role", role);
    navigate("/terminos-y-condiciones");
  };

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block" />
      <p className="text-2xl font-semibold text-center my-6">
        Desea ingresar como...
      </p>

      <Button className="w-full mb-5" onClick={() => setRoleAndGo("patient")}>
        Cliente
      </Button>

      <Button className="w-full" onClick={() => setRoleAndGo("nutritionist")}>
        Nutricionista
      </Button>
    </AuthLayout>
  );
};

export default LandingAcceso;