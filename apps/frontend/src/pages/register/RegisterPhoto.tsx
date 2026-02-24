import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";

const RegisterPhoto: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (!role) {
      navigate("/landing-acceso", { replace: true });
    }
  }, [navigate]);

  const goNextByRole = () => {
    const role = localStorage.getItem("nutrium_role");

    if (role === "nutritionist") {
      navigate("/onboarding/nutritionist");
      return;
    }

    if (role === "patient") {
      navigate("/onboarding/patient");
      return;
    }

    // fallback si no hay role o es inválido
    navigate("/landing-acceso", { replace: true });
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

      <Button className="w-full mb-3" onClick={goNextByRole}>
        Continuar
      </Button>

      <Button variant="secondary" className="w-full" onClick={goNextByRole}>
        Omitir
      </Button>
    </AuthLayout>
  );
};

export default RegisterPhoto;