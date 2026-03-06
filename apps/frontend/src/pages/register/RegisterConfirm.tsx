import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";
import { ReadOnlyField } from "../../components/common/ReadOnlyField";
import { api } from "../../services/api";
import { storage } from "../../utils/storage";

type NutritionistPersonal = {
  fullName: string;
  email: string;
  modalidad: string;
  formacion: string;
  especializacion: string;
  disponibilidad: string;
};

type NutritionistProfessional = {
  matricula: string;
  pais: string;
  ciudad: string;
  tituloHabilitante: string;
  anosExperiencia: string;
  tagIds: number[];
};

type PatientPersonal = {
  fullName: string;
  birthDate: string;
  country: string;
  city: string;
  email: string;
  modalidad: string;
  disponibilidad: string;
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

const LABEL_MAP: Record<string, Record<string, string>> = {
  modalidad: { online: "Virtual", presencial: "Presencial", hibrido: "Híbrido" },
  disponibilidad: { manana: "Mañana", tarde: "Tarde", flexible: "Flexible" },
  country: { AR: "Argentina", UY: "Uruguay", ES: "España" },
};

const displayLabel = (field: string, value: string) =>
  LABEL_MAP[field]?.[value] || value;

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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    try {
      if (role === "nutritionist" && nutriPersonal && nutriProfessional) {
        setIsLoading(true);
        setError(null);

        // 1. Login para obtener token (ya está registrado)
        const password = sessionStorage.getItem("nutrium_temp_password");
        if (!password) {
          alert("Sesión expirada. Vuelve a introducir tus datos.");
          return navigate("/register/nutritionist/personal");
        }

        const { token, user } = await api.login({
          email: nutriPersonal.email,
          password,
        });
        storage.setToken(token);
        if (user) storage.setUser(user);

        // 2. Crear perfil de nutricionista
        const profilePayload = {
          license_number: nutriProfessional.matricula,
          bio: nutriPersonal.especializacion || "Nutricionista profesional",
          modality: nutriPersonal.modalidad || "online",
          years_of_experience: parseInt(nutriProfessional.anosExperiencia) || 0,
          country: nutriProfessional.pais,
          city: nutriProfessional.ciudad,
          tag_ids: nutriProfessional.tagIds || [],
        };
        console.log("[RegisterConfirm] Profile payload:", profilePayload);

        try {
          await api.createNutritionistProfile(token, profilePayload);
        } catch (profileErr: any) {
          console.warn("[RegisterConfirm] Profile creation failed:", profileErr.message);
          // No bloquear el flujo: la cuenta ya existe, el perfil se puede completar después
          setError(
            "Tu cuenta fue creada pero el perfil no se pudo guardar (error del servidor). " +
            "Podrás completarlo después. Redirigiendo..."
          );
          // Esperar un momento para que el usuario vea el mensaje
          await new Promise((r) => setTimeout(r, 2000));
        }

        // 3. Limpiar contraseña temporal
        sessionStorage.removeItem("nutrium_temp_password");

        return navigate("/match-nutricionista");
      }

      if (role === "patient" && patientPersonal && patientHealth) {
        setIsLoading(true);
        setError(null);

        const password = sessionStorage.getItem("nutrium_temp_password");
        if (!password) {
          alert("Sesión expirada. Vuelve a introducir tus datos.");
          return navigate("/register/patient/personal");
        }

        const { token, user } = await api.login({
          email: patientPersonal.email,
          password,
        });
        storage.setToken(token);
        if (user) storage.setUser(user);

        const patientProfilePayload = {
          birth_date: patientPersonal.birthDate,
          gender: "prefiero_no_decir",
          health_goals: patientPersonal.objetivo || "Mejorar mi salud general",
          languages: ["es"],
          modality: patientPersonal.modalidad,
          country: displayLabel("country", patientPersonal.country),
          city: patientPersonal.city,
        };
        console.log("[RegisterConfirm] Patient profile payload:", patientProfilePayload);

        try {
          await api.upsertPatientProfile(token, patientProfilePayload);
        } catch (profileErr: any) {
          console.warn("[RegisterConfirm] Patient profile creation failed:", profileErr.message);
          setError(
            "Tu cuenta fue creada pero el perfil no se pudo guardar: " + profileErr.message +
            ". Redirigiendo..."
          );
          await new Promise((r) => setTimeout(r, 2500));
        }

        sessionStorage.removeItem("nutrium_temp_password");

        return navigate("/match-paciente");
      }

      if (role === "patient") return navigate("/match-paciente");
      navigate("/landing-acceso");
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al crear perfil");
    } finally {
      setIsLoading(false);
    }
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
          <p className="text-sm text-slate-500 mt-1">Revisa tus datos antes de continuar.</p>
        </div>
      </div>

      <div className="space-y-6">
        {role === "nutritionist" && nutriPersonal && nutriProfessional && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Formulario Personal</h3>
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
              <ReadOnlyField label="Modalidad" value={displayLabel("modalidad", nutriPersonal.modalidad)} />
              <ReadOnlyField label="Formación" value={nutriPersonal.formacion} />
              <ReadOnlyField label="Especialización" value={nutriPersonal.especializacion} />
              <ReadOnlyField label="Disponibilidad" value={displayLabel("disponibilidad", nutriPersonal.disponibilidad)} />
            </section>

            <section className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Formulario Profesional</h3>
                <button
                  type="button"
                  onClick={() => navigate("/register/nutritionist/professional")}
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
                <h3 className="font-semibold text-slate-700">Formulario Personal</h3>
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
              <ReadOnlyField label="País" value={displayLabel("country", patientPersonal.country)} />
              <ReadOnlyField label="Ciudad" value={patientPersonal.city} />
              <ReadOnlyField label="Correo electrónico" value={patientPersonal.email} />
              <ReadOnlyField label="Modalidad" value={displayLabel("modalidad", patientPersonal.modalidad)} />
              <ReadOnlyField label="Disponibilidad" value={displayLabel("disponibilidad", patientPersonal.disponibilidad)} />
              <ReadOnlyField label="Objetivo" value={patientPersonal.objetivo} />
            </section>

            <section className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Formulario de Salud</h3>
                <button
                  type="button"
                  onClick={() => navigate("/register/patient/health")}
                  className="text-sm text-[#7ECD43] font-medium hover:underline"
                >
                  Editar
                </button>
              </div>

              <ReadOnlyField label="¿Padeces alguna condición?" value={patientHealth.condition} />
              {patientHealth.condition === "otra" && (
                <ReadOnlyField label="Descripción" value={patientHealth.conditionDetails} />
              )}
            </section>
          </>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button className="w-full" onClick={handleContinue} isLoading={isLoading}>
          Continuar
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterConfirm;