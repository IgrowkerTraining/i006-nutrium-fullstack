import React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import cerrar from "../assets/Cerrar.png";
import nutricionista from "../assets/nutricionista.png";
import { Button } from "../components/common/Button";

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
    <div>
      <article className="pl-4 border-b border-[#7ECD43] pb-2 mt-4">
        <h2 className="text-[2em] font-bold mb-2">Listado de Nutricionistas</h2>
        <p className="text-[1.25em]">Estos nutricionistas tienen mas compatibilidad con lo que estás buscando.</p>
      </article>
      <p className="ml-4 mb-12">* Las recomendaciones se basan en la información proporcionada y no sustituyen evualuación médica</p>
      {nutricionistas.map((n) => (
        <div key={n.matrícula} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <img src={nutricionista} alt="foto perfil nutricionista" className="w-20 h-20 rounded-full object-cover object-center bg-slate-100" />
            <article>
              <h3 className="font-bold text-[1.25em]">Dra./Dr. {n.name}</h3>
              <p className="text-gray-400">{n.specialty}</p>
              <p className="text-gray-400">Matrícula: {n.matrícula}</p>
              <p className="bg-[#7ECD43] text-white px-2 py-1 rounded-xl text-xs inline">Compatibilidad {n.compatibilidad}%</p>
            </article>
            <img src={cerrar} alt="cerrar" />
          </div>
          <div className="flex justify-around gap-6 p-4">
            <div className="flex items-center gap-2">
              <img src={modalidad} alt="modalidad" />
              <article>
                <p>Modalidad</p>
                <p>{n.modalidad}</p>
              </article>
            </div>
            <div className="flex items-center gap-2">
              <img src={disponibilidad} alt="disponibilidad" />
              <article>
                <p>Disponibilidad:</p>
                <p>{n.disponibilidad}</p>
              </article>
            </div>
          </div>
            <Button className="w-[90%] mx-auto mb-4">Agendar cita</Button>
        </div>
      ))}
    </div>
  );
};

export default MatchNutriList;
