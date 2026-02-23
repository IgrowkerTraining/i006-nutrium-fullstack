import React from "react";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import nutri from "../assets/nutri.png";

const HomePage: React.FC = () => {
  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={nutri} alt="Nutri saludando" className="w-[100%] mx-auto block"/>
    </AuthLayout>
  );
};

export default HomePage;