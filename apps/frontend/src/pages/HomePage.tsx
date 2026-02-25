import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import logo from "../assets/nutrium-logo.svg";
import nutri from "../assets/nutri.png";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const showLoadingTimeoutId = window.setTimeout(() => {
      setShowLoading(true);
    }, 1000);

    const redirectTimeoutId = window.setTimeout(() => {
      navigate("/landing-acceso", { replace: true });
    }, 3000);

    return () => {
      window.clearTimeout(showLoadingTimeoutId);
      window.clearTimeout(redirectTimeoutId);
    };
  }, [navigate]);

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={nutri} alt="Nutri saludando" className="w-[100%] mx-auto block"/>
      {showLoading ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#7ECD43]" />
          <p className="text-slate-500 font-medium">Accediendo...</p>
        </div>
      ) : null}
    </AuthLayout>
  );
};

export default HomePage;