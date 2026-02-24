import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";

const RegisterPhoto: React.FC = () => {
  const navigate = useNavigate();

  const role = localStorage.getItem("nutrium_role");

  useEffect(() => {
    if (!role) {
      navigate("/landing-acceso", { replace: true });
    }
  }, [role, navigate]);

  const handleContinue = () => {
    if (role === "nutritionist") {
      navigate("/dashboard");
    } else if (role === "patient") {
      navigate("/dashboard");
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-center mb-2">
        Queremos conocerte!
      </h2>

      <p className="text-center text-slate-500 mb-6">
        Sube una foto tuya para que podamos personalizar tu experiencia.
      </p>

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center mb-6">
        <p className="text-slate-400">Subir desde el móvil</p>
        <p className="text-slate-400 mt-2">Tomar desde la cámara</p>
      </div>

      <Button className="w-full mb-3" onClick={handleContinue}>
        Continuar
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleContinue}
      >
        Omitir
      </Button>
    </AuthLayout>
  );
};

export default RegisterPhoto;