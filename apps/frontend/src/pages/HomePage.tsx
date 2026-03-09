import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import nutri from "../assets/nutri-saludando.gif";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const redirectTimeoutId = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);

    return () => {
      window.clearTimeout(redirectTimeoutId);
    };
  }, [navigate]);

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={nutri} alt="Nutri saludando" className="w-[100%] mx-auto block"/>
    </AuthLayout>
  );
};

export default HomePage;