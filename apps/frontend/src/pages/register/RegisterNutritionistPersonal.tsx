import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthLayout } from "../../components/layout/AuthLayout";
import { LogoHeader } from "../../components/common/LogoHeader";
import { Input } from "../../components/common/Input";
import { PasswordInput } from "../../components/common/PasswordInput";
import { Button } from "../../components/common/Button";
import { Select } from "../../components/common/Select";
import { BackButton } from "../../components/common/BackButton";
import { api } from "../../services/api";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  modalidad: string;
  formacion: string;
  especializacion: string;
  disponibilidad: string;
};

const STORAGE_KEY = "nutrium_register_nutritionist_personal";

const RegisterNutritionistPersonal: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    modalidad: "",
    formacion: "",
    especializacion: "",
    disponibilidad: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard de rol
  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (role !== "nutritionist") {
      navigate("/landing-acceso", { replace: true });
    }
  }, [navigate]);

  // Prefill desde localStorage (SIN password)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setForm((prev) => ({
        ...prev,
        ...data,
        password: "",
        confirmPassword: "",
      }));
    } catch {}
  }, []);

  // Autosave (SIN password)
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        modalidad: form.modalidad,
        formacion: form.formacion,
        especializacion: form.especializacion,
        disponibilidad: form.disponibilidad,
      })
    );
  }, [
    form.fullName,
    form.email,
    form.modalidad,
    form.formacion,
    form.especializacion,
    form.disponibilidad,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError("Introduce tu nombre completo.");
    if (!form.email.trim()) return setError("Introduce tu correo.");
    if (form.password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");
    if (form.password !== form.confirmPassword)
      return setError("Las contraseñas no coinciden.");
    if (!form.modalidad) return setError("Selecciona una modalidad.");
    if (!form.formacion) return setError("Selecciona una formación.");
    if (!form.especializacion) return setError("Selecciona una especialización.");
    if (!form.disponibilidad) return setError("Selecciona una disponibilidad.");

    setIsLoading(true);

    try {
      // Guardamos SIN password
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          modalidad: form.modalidad,
          formacion: form.formacion,
          especializacion: form.especializacion,
          disponibilidad: form.disponibilidad,
        })
      );

      await api.register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: "nutritionist",
      });

      navigate("/register/nutritionist/professional");
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const modalidadOptions = [
    { value: "", label: "Elige una opción" },
    { value: "online", label: "Online" },
    { value: "presencial", label: "Presencial" },
    { value: "mixta", label: "Mixta" },
  ];

  const formacionOptions = [
    { value: "", label: "Elige una opción" },
    { value: "grado", label: "Grado" },
    { value: "master", label: "Máster" },
    { value: "posgrado", label: "Posgrado" },
  ];

  const especializacionOptions = [
    { value: "", label: "Elige una opción" },
    { value: "deportiva", label: "Nutrición deportiva" },
    { value: "clinica", label: "Nutrición clínica" },
    { value: "pediatrica", label: "Nutrición pediátrica" },
    { value: "perdida_peso", label: "Pérdida de peso" },
  ];

  const disponibilidadOptions = [
    { value: "", label: "Elige una opción" },
    { value: "mananas", label: "Mañanas" },
    { value: "tardes", label: "Tardes" },
    { value: "noches", label: "Noches" },
    { value: "flexible", label: "Flexible" },
  ];

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <BackButton />
      </div>

      <LogoHeader
        title="Formulario Personal"
        subtitle="Usaremos esta información para conectarte con pacientes que se ajusten a tus preferencias."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Input label="Nombre completo*" name="fullName" required value={form.fullName} onChange={handleChange} />
        <Input label="Correo electrónico*" name="email" type="email" required value={form.email} onChange={handleChange} />

        <PasswordInput
          label="Contraseña*"
          required
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />

        <PasswordInput
          label="Repetir contraseña*"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
        />

        <Select label="Modalidad*" value={form.modalidad} onChange={(e) => setForm((p) => ({ ...p, modalidad: e.target.value }))} options={modalidadOptions} />
        <Select label="Formación*" value={form.formacion} onChange={(e) => setForm((p) => ({ ...p, formacion: e.target.value }))} options={formacionOptions} />
        <Select label="Especialización*" value={form.especializacion} onChange={(e) => setForm((p) => ({ ...p, especializacion: e.target.value }))} options={especializacionOptions} />
        <Select label="Disponibilidad*" value={form.disponibilidad} onChange={(e) => setForm((p) => ({ ...p, disponibilidad: e.target.value }))} options={disponibilidadOptions} />

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Continuar
        </Button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-[#7ECD43] font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterNutritionistPersonal;