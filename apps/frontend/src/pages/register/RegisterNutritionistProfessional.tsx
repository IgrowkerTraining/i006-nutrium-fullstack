import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { LogoHeader } from "../../components/common/LogoHeader";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

const RegisterNutritionist: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    matricula: "",
    pais: "",
    ciudad: "",
    tituloHabilitante: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Si tu Select devuelve e.target.value, cambia esto
  const handleSelect = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: llamada API cuando la tengáis
    console.log("REGISTER NUTRI:", form);
    // navigate("/onboarding/nutritionist"); o donde toque
  };

  return (
    <AuthLayout>
      <LogoHeader
        title="Formulario Profesional"
        subtitle="Usaremos esta información para verificar si tu matrícula es correcta para prácticas."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Matrícula*"
          name="matricula"
          placeholder="MB7854"
          required
          value={form.matricula}
          onChange={handleChange}
        />

        <Select
          label="País*"
          value={form.pais}
          onChange={(value: string) => handleSelect("pais", value)}
          options={[
            { label: "Elige una opción", value: "" },
            { label: "Argentina", value: "AR" },
            { label: "Uruguay", value: "UY" },
            { label: "España", value: "ES" },
          ]}
        />

        <Input
          label="Ciudad*"
          name="ciudad"
          placeholder="Ciudad"
          required
          value={form.ciudad}
          onChange={handleChange}
        />

        <Input
          label="Título habilitante*"
          name="tituloHabilitante"
          placeholder="Subir documento"
          required
          value={form.tituloHabilitante}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full">
          Confirmar
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => navigate("/login")}
        >
          Cancelar
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterNutritionist;