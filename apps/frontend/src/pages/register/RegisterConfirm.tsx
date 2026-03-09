import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";
import { ReadOnlyField } from "../../components/common/ReadOnlyField";

type NutritionistPersonal = {
  fullName: string;
  email: string;
  modalidad: string;
  formacion: string;
  especializacion: string;
  horarioDesde: string;
  horarioHasta: string;
};

type NutritionistProfessional = {
  matricula: string;
  pais: string;
  ciudad: string;
  tituloHabilitante: string;
};

type PatientPersonal = {
  fullName: string;
  birthDate: string;
  country: string;
  city: string;
  email: string;
  modalidad: string;
  horarioDesde: string;
  horarioHasta: string;
  objetivo: string;
};

type PatientHealth = {
  condition: string;
  conditionDetails: string;
};

function safeParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const RegisterConfirm: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("nutrium_role");

  const nutriPersonal = useMemo(
    () => safeParse<NutritionistPersonal>("nutrium_register_nutritionist_personal"),
    []
  );

  const nutriProfessional = useMemo(
    () => safeParse<NutritionistProfessional>("nutrium_register_nutritionist_professional"),
    []
  );

  const patientPersonal = useMemo(
    () => safeParse<PatientPersonal>("nutrium_register_patient_personal"),
    []
  );

  const patientHealth = useMemo(
    () => safeParse<PatientHealth>("nutrium_register_patient_health"),
    []
  );

  useEffect(() => {
    if (!role) {
      navigate("/landing-acceso", { replace: true });
      return;
    }

    if (role === "nutritionist") {
      if (!nutriPersonal) {
        navigate("/register/nutritionist/personal", { replace: true });
        return;
      }
      if (!nutriProfessional) {
        navigate("/register/nutritionist/professional", { replace: true });
        return;
      }
    }

    if (role === "patient") {
      if (!patientPersonal) {
        navigate("/register/patient/personal", { replace: true });
        return;
      }
      if (!patientHealth) {
        navigate("/register/patient/health", { replace: true });
        return;
      }
    }
  }, [role, navigate, nutriPersonal, nutriProfessional, patientPersonal, patientHealth]);

  const handleContinue = () => {
    if (role === "nutritionist") return navigate("/onboarding/nutritionist");
    if (role === "patient") return navigate("/onboarding/patient");
    navigate("/landing-acceso");
  };

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 p-2 rounded-full hover:bg-black/5 transition"
          aria-label="Volver"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-semibold">Confirmación de datos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Revisa tus datos antes de continuar.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {role === "nutritionist" && nutriPersonal && nutriProfessional && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Formulario Personal
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/register/nutritionist/personal")}
                  className="text-sm text-[#7ECD43] font-medium hover:underline"
                >
                  Editar
                </button>
              </div>

              <ReadOnlyField label="Nombre completo" value={nutriPersonal.fullName} />
              <ReadOnlyField label="Correo electrónico" value={nutriPersonal.email} />
              <ReadOnlyField label="Modalidad" value={nutriPersonal.modalidad} />
              <ReadOnlyField label="Formación" value={nutriPersonal.formacion} />
              <ReadOnlyField label="Especialización" value={nutriPersonal.especializacion} />
              <ReadOnlyField
                label="Disponibilidad horaria"
                value={`${nutriPersonal.horarioDesde} - ${nutriPersonal.horarioHasta}`}
              />
            </section>

            <section className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Formulario Profesional
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/register/nutritionist/professional")
                  }
                  className="text-sm text-[#7ECD43] font-medium hover:underline"
                >
                  Editar
                </button>
              </div>

              <ReadOnlyField label="Matrícula" value={nutriProfessional.matricula} />
              <ReadOnlyField label="País" value={nutriProfessional.pais} />
              <ReadOnlyField label="Ciudad" value={nutriProfessional.ciudad} />
              <ReadOnlyField
                label="Título habilitante"
                value={nutriProfessional.tituloHabilitante}
              />
            </section>
          </>
        )}

        {role === "patient" && patientPersonal && patientHealth && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Formulario Personal
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/register/patient/personal")}
                  className="text-sm text-[#7ECD43] font-medium hover:underline"
                >
                  Editar
                </button>
              </div>

              <ReadOnlyField label="Nombre completo" value={patientPersonal.fullName} />
              <ReadOnlyField label="Fecha de nacimiento" value={patientPersonal.birthDate} />
              <ReadOnlyField label="País" value={patientPersonal.country} />
              <ReadOnlyField label="Ciudad" value={patientPersonal.city} />
              <ReadOnlyField label="Correo electrónico" value={patientPersonal.email} />
              <ReadOnlyField label="Modalidad" value={patientPersonal.modalidad} />
              <ReadOnlyField
                label="Disponibilidad horaria"
                value={`${patientPersonal.horarioDesde} - ${patientPersonal.horarioHasta}`}
              />
              <ReadOnlyField label="Objetivo" value={patientPersonal.objetivo} />
            </section>

            <section className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">
                  Formulario de Salud
                </h3>
                <button
                  type="button"
                  onClick={() => navigate("/register/patient/health")}
                  className="text-sm text-[#7ECD43] font-medium hover:underline"
                >
                  Editar
                </button>
              </div>

              <ReadOnlyField
                label="¿Padeces alguna condición?"
                value={patientHealth.condition}
              />

              {patientHealth.condition === "otra" && (
                <ReadOnlyField
                  label="Descripción"
                  value={patientHealth.conditionDetails}
                />
              )}
            </section>
          </>
        )}

        <Button className="w-full" onClick={handleContinue}>
          Continuar
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterConfirm;