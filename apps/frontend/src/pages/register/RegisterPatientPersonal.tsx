import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { AuthLayout } from "../../components/layout/AuthLayout";
import { LogoHeader } from "../../components/common/LogoHeader";
import { Input } from "../../components/common/Input";
import { PasswordInput } from "../../components/common/PasswordInput";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { BackButton } from "../../components/common/BackButton";

type FormState = {
  fullName: string;
  birthDate: string;
  country: string;
  city: string;
  email: string;
  password: string;
  confirmPassword: string;
  modalidad: string;
  disponibilidad: string;
  objetivo: string;
};

const STORAGE_KEY = "nutrium_register_patient_personal";

const RegisterPatientPersonal: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    birthDate: "",
    country: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: "",
    modalidad: "",
    disponibilidad: "",
    objetivo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (role !== "patient") {
      navigate("/landing-acceso", { replace: true });
    }
  }, [navigate]);

  // Prefill SIN password
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

  // Autosave SIN password
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fullName: form.fullName,
        birthDate: form.birthDate,
        country: form.country,
        city: form.city,
        email: form.email,
        modalidad: form.modalidad,
        disponibilidad: form.disponibilidad,
        objetivo: form.objetivo,
      })
    );
  }, [
    form.fullName,
    form.birthDate,
    form.country,
    form.city,
    form.email,
    form.modalidad,
    form.disponibilidad,
    form.objetivo,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError("Introduce tu nombre completo.");
    if (!form.birthDate.trim()) return setError("Introduce tu fecha de nacimiento.");
    if (!form.country) return setError("Selecciona tu país.");
    if (!form.city.trim()) return setError("Introduce tu ciudad.");
    if (!form.email.trim()) return setError("Introduce tu correo.");
    if (form.password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");
    if (form.password !== form.confirmPassword)
      return setError("Las contraseñas no coinciden.");
    if (!form.modalidad) return setError("Selecciona una modalidad.");
    if (!form.disponibilidad) return setError("Selecciona una disponibilidad.");
    if (!form.objetivo.trim()) return setError("Introduce tu objetivo.");

    setIsLoading(true);
    try {
      // Guardamos SIN password
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fullName: form.fullName,
          birthDate: form.birthDate,
          country: form.country,
          city: form.city,
          email: form.email,
          modalidad: form.modalidad,
          disponibilidad: form.disponibilidad,
          objetivo: form.objetivo,
        })
      );

      navigate("/register/patient/health");
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const countryOptions = [
    { value: "", label: "Elige una opción" },
    { value: "AR", label: "Argentina" },
    { value: "UY", label: "Uruguay" },
    { value: "ES", label: "España" },
  ];

  const modalidadOptions = [
    { value: "", label: "Virtual / Presencial / Mixto" },
    { value: "online", label: "Virtual" },
    { value: "presencial", label: "Presencial" },
    { value: "mixto", label: "Mixto" },
  ];

  const disponibilidadOptions = [
    { value: "", label: "Mañana / Tarde" },
    { value: "manana", label: "Mañana" },
    { value: "tarde", label: "Tarde" },
    { value: "flexible", label: "Flexible" },
  ];

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <BackButton />
      </div>

      <LogoHeader
        title="Formulario Personal"
        subtitle="Usaremos esta información para conectarte con profesionales que se ajusten a tus preferencias."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <Input label="Nombre completo*" name="fullName" required value={form.fullName} onChange={handleChange} />
        <Input label="Fecha de nacimiento*" name="birthDate" required value={form.birthDate} onChange={handleChange} />
        <Select label="País*" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} options={countryOptions} />
        <Input label="Ciudad*" name="city" required value={form.city} onChange={handleChange} />
        <Input label="Correo electrónico*" name="email" type="email" required value={form.email} onChange={handleChange} />

        <PasswordInput
          label="Contraseña*"
          required
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />

        <PasswordInput
          label="Repita su contraseña*"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
        />

        <Select label="Modalidad*" value={form.modalidad} onChange={(e) => setForm((p) => ({ ...p, modalidad: e.target.value }))} options={modalidadOptions} />
        <Select label="Disponibilidad*" value={form.disponibilidad} onChange={(e) => setForm((p) => ({ ...p, disponibilidad: e.target.value }))} options={disponibilidadOptions} />
        <Input label="Objetivo*" name="objetivo" required value={form.objetivo} onChange={handleChange} />

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

export default RegisterPatientPersonal;