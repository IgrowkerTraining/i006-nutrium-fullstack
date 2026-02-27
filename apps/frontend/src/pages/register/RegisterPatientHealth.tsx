import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../../components/layout/AuthLayout";
import { LogoHeader } from "../../components/common/LogoHeader";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { BackButton } from "../../components/common/BackButton";

type FormState = {
  condition: string;
  conditionDetails: string;
};

const STORAGE_KEY = "nutrium_register_patient_health";
const PERSONAL_KEY = "nutrium_register_patient_personal";

const RegisterPatientHealth: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    condition: "",
    conditionDetails: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards
  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (role !== "patient") {
      navigate("/landing-acceso", { replace: true });
      return;
    }

    const personal = localStorage.getItem(PERSONAL_KEY);
    if (!personal) {
      navigate("/register/patient/personal", { replace: true });
    }
  }, [navigate]);

  // Prefill
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setForm((prev) => ({ ...prev, ...data }));
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const conditionOptions = [
    { value: "", label: "Elige una opción" },
    { value: "none", label: "No" },
    { value: "sibo", label: "SIBO" },
    { value: "diabetes", label: "Diabetes" },
    { value: "celiaquia", label: "Celiaquía" },
    { value: "tiroides", label: "Tiroides" },
    { value: "otra", label: "Otra" },
  ];

  const needsDetails = form.condition === "otra";

  useEffect(() => {
    if (form.condition !== "otra" && form.conditionDetails) {
      setForm((p) => ({ ...p, conditionDetails: "" }));
    }
  }, [form.condition]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.condition) return setError("Selecciona una opción.");
    if (needsDetails && !form.conditionDetails.trim()) {
      return setError("Por favor, añade una breve descripción.");
    }

    setIsLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      navigate("/register/photo");
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <BackButton />
      </div>

      <LogoHeader
        title="Formulario de Salud"
        subtitle="La información que completes será utilizada exclusivamente para generar recomendaciones personalizadas y será tratada conforme a la normativa de protección de datos vigentes."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Select
          label="¿Padeces de alguna condición?"
          name="condition"
          required
          disabled={isLoading}
          value={form.condition}
          onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
          options={conditionOptions}
        />

        {needsDetails && (
          <Input
            label="Si tu respuesta es otra especifica"
            name="conditionDetails"
            placeholder="Breve descripción"
            required
            disabled={isLoading}
            value={form.conditionDetails}
            onChange={(e) =>
              setForm((p) => ({ ...p, conditionDetails: e.target.value }))
            }
          />
        )}

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Continuar
        </Button>

        {/* Botón para DEV */}
        {import.meta.env.DEV && (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, JSON.stringify({
                condition: "none",
                conditionDetails: "",
              }));
              navigate("/register/photo");
            }}
          >
            [DEV] Skip
          </Button>
        )}


        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => navigate("/register/patient/personal")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPatientHealth;