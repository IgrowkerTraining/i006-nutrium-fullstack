import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileField } from "../components/profile/ProfileField";
import { Button } from "../components/common/Button";
import nutricionistaDefault from "../assets/nutricionista.png";

// TODO: Añadir los elementos reales del diseño, esta hecho solo de paso.

const PerfilesMatchPaciente: React.FC = () => {
  const { state: paciente } = useLocation();
  const navigate = useNavigate();

  if (!paciente) {
    return <p className="p-6">No se encontró información del paciente.</p>;
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 pb-24">
        <section className="px-6">
          <h2 className="text-xl font-semibold text-left">
            Perfil del Paciente
          </h2>
          <p className="text-sm text-red-500 font-bold">** Diseño no definitivo **</p>
        </section>

        <hr className="w-screen border-t-1 border-[#7ECD43] my-4" />

        <section className="flex justify-center mx-6 my-[clamp(43px,10.94vw,80px)]">
          <img
            src={paciente.profile_picture_url || nutricionistaDefault}
            alt={paciente.user?.name || "Paciente"}
            className="w-[clamp(260px,85vw,600px)] h-auto aspect-[334/293] object-cover rounded-xl"
          />
        </section>

        <section className="flex flex-col gap-4">
          <ProfileField label="Nombre completo" value={` ${paciente.user?.name || "Sin nombre"}`} />
          <ProfileField label="Fecha de nacimiento" value={paciente.birth_date || "No especificada"} />
          <ProfileField label="País" value={paciente.country || "No disponible"} />
          <ProfileField label="Ciudad" value={paciente.city || "No disponible"} />
          <ProfileField label="Modalidad" value={paciente.modality || "No especificada"} />
        </section>

        <section className="flex flex-col gap-4 mx-6 mt-8">
          <Button className="w-full rounded-2xl">
            Agendar cita
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </section>
      </main>
    </div>
  );
};

export default PerfilesMatchPaciente;