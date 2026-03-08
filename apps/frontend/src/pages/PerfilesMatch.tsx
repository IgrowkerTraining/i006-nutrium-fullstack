import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileField } from "../components/profile/ProfileField";
import { Button } from "../components/common/Button";
import nutricionistaDefault from "../assets/nutricionista.png";

// TODO: Añadir los elementos reales del diseño, esta hecho solo de paso.

const PerfilesMatch: React.FC = () => {
  const { state: nutri } = useLocation();
  const navigate = useNavigate();

  if (!nutri) {
    return <p className="p-6">No se encontró información del nutricionista.</p>;
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 pb-24">
        <section className="px-6">
          <h2 className="text-xl font-semibold text-left">
            Perfil del Nutricionista
          </h2>
          <p className="text-sm text-red-500 font-bold">** Diseño no definitivo **</p>
        </section>

        <hr className="w-screen border-t-1 border-[#7ECD43] my-4" />

        <section className="flex justify-center mx-6 my-[clamp(43px,10.94vw,80px)]">
          <img
            src={nutri.profile_picture_url || nutricionistaDefault}
            alt={nutri.user?.name || "Nutricionista"}
            className="w-[clamp(260px,85vw,600px)] h-auto aspect-[334/293] object-cover rounded-xl"
          />
        </section>

        <section className="flex flex-col gap-4">
          <ProfileField label="Nombre completo" value={`Dra./Dr. ${nutri.user?.name || "Sin nombre"}`} />
          <ProfileField label="Especialización" value={nutri.bio || "No especificada"} />
          <ProfileField label="Matrícula" value={nutri.license_number || "No disponible"} />
          <ProfileField label="Modalidad de atención" value={nutri.modality || "No especificada"} />
          <ProfileField label="Experiencia" value={`${nutri.years_of_experience || 0} años`} />
          {nutri.compatibility != null && (
            <ProfileField label="Compatibilidad" value={`${Math.round(nutri.compatibility)}%`} />
          )}
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

export default PerfilesMatch;