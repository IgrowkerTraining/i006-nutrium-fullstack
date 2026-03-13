import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { LogoHeader } from "../../components/common/LogoHeader";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { BackButton } from "../../components/common/BackButton";

const STORAGE_KEY = "nutrium_register_nutritionist_professional";
const PERSONAL_KEY = "nutrium_register_nutritionist_personal";

const RegisterNutritionistProfessional: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    matricula: "",
    pais: "",
    ciudad: "",
    tituloHabilitante: "",
    anosExperiencia: "",
  });

  const [error, setError] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<number[]>([]);


  // Guard + que exista personal antes
  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (role !== "nutritionist") {
      navigate("/landing-acceso", { replace: true });
      return;
    }
    const personal = localStorage.getItem(PERSONAL_KEY);
    if (!personal) {
      navigate("/register/nutritionist/personal", { replace: true });
    }
  }, [navigate]);

  // Prefill
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setForm((prev) => ({ ...prev, ...data }));
      if (data.tagIds) setSelectedTags(data.tagIds);
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.matricula.trim()) return setError("Introduce tu matrícula.");
    if (!form.pais) return setError("Selecciona tu país.");
    if (!form.ciudad.trim()) return setError("Introduce tu ciudad.");
    if (!form.tituloHabilitante.trim())
      return setError("Introduce tu título habilitante.");
    if (String(form.anosExperiencia).trim() === "")
      return setError("Introduce tus años de experiencia.");
    if (isNaN(Number(form.anosExperiencia)) || Number(form.anosExperiencia) < 0)
      return setError("Los años de experiencia deben ser un número mayor o igual a 0.");
    if (selectedTags.length === 0)
      return setError("Selecciona al menos una especialidad.");

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form, tagIds: selectedTags }));
    navigate("/register/photo");
  };

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <BackButton />
      </div>

      <LogoHeader
        title="Formulario Profesional"
        subtitle="Usaremos esta información para verificar si tu matrícula es correcta para prácticas."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

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
          name="pais"
          required
          value={form.pais}
          onChange={(e) => setForm((p) => ({ ...p, pais: e.target.value }))}
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

        <Input
          label="Años de experiencia*"
          name="anosExperiencia"
          type="number"
          placeholder="5"
          required
          value={form.anosExperiencia}
          onChange={handleChange}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Especialidades*</label>
          {[
            { id: 1, name: "Diabetes tipo 2" },
            { id: 8, name: "Nutrición deportiva" },
            { id: 16, name: "Pérdida de peso" },
            { id: 9, name: "Nutrición pediátrica" },
            { id: 11, name: "Nutrición vegetariana" },
            { id: 18, name: "Salud digestiva" },
          ].map((tag) => (
            <label key={tag.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.id)}
                onChange={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  )
                }
              />
              {tag.name}
            </label>
          ))}
        </div>

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

export default RegisterNutritionistProfessional;