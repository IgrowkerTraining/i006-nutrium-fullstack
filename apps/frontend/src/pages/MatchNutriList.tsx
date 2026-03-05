import React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import cerrar from "../assets/Cerrar.png";
import nutricionista from "../assets/nutricionista.png";
import { Button } from "../components/common/Button";
import AppLayout from "../components/layout/AppLayout";

//Datos hardcodeados para pruebas
/* const nutricionistas = [
  {
    name: "Laura Gonzalez",
    specialty: "Nutrición clínica",
    matrícula: "MP 4597",
    compatibilidad: 98,
    modalidad: "Virtual",
    disponibilidad: "Mañana"
  },
  {
    name: "Maria Acosta",
    specialty: "Nutrición clínica",
    matrícula: "MP 1234",
    compatibilidad: 95,
    modalidad: "Presencial",
    disponibilidad: "Tarde"
  }
]; */


const MatchNutriList: React.FC = () => {
  const [nutricionistas, setNutricionistas] = useState([]);
  
  useEffect(() => {
    api.getNutritionists().then(setNutricionistas);
  }, []);
  
  /* const recomendados = [...nutricionistas] //hacemos spread para no mutar el array original
    .filter((n) => n.compatibilidad >= 80)
    .sort((a, b) => b.compatibilidad - a.compatibilidad); */

  return (
    <AppLayout>
      <article className="pl-4 border-b border-[#7ECD43] pb-2 mt-4">
        <h2 className="text-[1.25em] leading-[1.75em] font-bold mb-2">Listado de Nutricionistas</h2>
        <p className="text-[0.875em] leading-[1.375em]">Estos nutricionistas tienen mas compatibilidad con lo que estás buscando.</p>
      </article>
      <p className="text-[0.813em] leading-[1.25em] ml-4 mb-12">* Las recomendaciones se basan en la información proporcionada y no sustituyen evualuación médica</p>
      {nutricionistas.map((n: any) => (
        <div key={n.id} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <img src={n.profile_picture_url || nutricionista} alt="foto perfil nutricionista" className="w-[83px] h-[83px] rounded-full object-cover object-center bg-slate-100" />
            <article>
              <h3 className="font-semibold text-[1.125em] leading-[1.625em]">Dra./Dr. {n.user?.name || "Sin nombre"}</h3>
              <p className="text-[#6B7280] text-[0.875em] leading-[1.375em]">{n.bio || "Nutricionista"}</p>
              <p className="text-[#6B7280] text-[0.875em] leading-[1.375em]">Matrícula: {n.license_number}</p>
              {n.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {n.tags.map((tag: any) => (
                    <span key={tag.id} className="bg-[#7ECD43] text-white px-2 py-1 rounded-xl text-xs">{tag.name}</span>
                  ))}
                </div>
              )}
            </article>
            <img src={cerrar} alt="cerrar" />
          </div>
          <div className="flex justify-around gap-6 p-4">
            <div className="flex items-center gap-2">
              <img src={modalidad} alt="modalidad" />
              <article>
                <p>Modalidad</p>
                <p>{n.modality || "No especificada"}</p>
              </article>
            </div>
            <div className="flex items-center gap-2">
              <img src={disponibilidad} alt="disponibilidad" />
              <article>
                <p>Experiencia:</p>
                <p>{n.years_of_experience} años</p>
              </article>
            </div>
          </div>
            <Button className="w-[90%] mx-auto mb-4">Agendar cita</Button>
        </div>
      ))}
    </AppLayout>
  );
};

export default MatchNutriList;
