import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import logo from "../../assets/nutrium-logo.svg";
import animation from "../../assets/NUTRIUM-Animacion.gif"
import { storage } from "../../utils/storage";

const Match: React.FC = () => {
  const navigate = useNavigate();
  const token = storage.getToken();
  const hasRealSession = Boolean(token && token !== "mock-token");

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/match/nutri-list");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={animation} alt="animation" className="w-[80%] mx-auto block mb-10"/>
      {!hasRealSession && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          Necesitas iniciar sesión real para ver recomendaciones.
        </div>
      )}
      <p className="px-3 text-center">Estamos buscando nutricionistas acorde a tu perfil...</p>
    </AuthLayout>
  );
};

export default Match;