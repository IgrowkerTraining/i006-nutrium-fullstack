import React from "react";
import paciente1 from "../assets/paciente1.png";
import paciente2 from "../assets/paciente2.jpg";
import cerrar from "../assets/Cerrar.png";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import { Button } from "../components/common/Button";

// TODO: Replace with actual data from API
//Datos hardcodeados para pruebas
const pacientes = [
  {
    name: "Clara García",
    id: 1,
    profesión: "Estudiante",
    compatibilidad: 98,
    modalidad: "Presencial",
    disponibilidad: "Mañana",
    foto: paciente1
  },
  {
    name: "Pedro Gomez",
    id: 2,
    profesión: "Abogado",
    compatibilidad: 96,
    modalidad: "Virtual",
    disponibilidad: "Tarde",
    foto: paciente2
  }
];

const recomendados = [...pacientes] //hacemos spread para no mutar el array original
  .filter((p) => p.compatibilidad >= 80)
  .sort((a, b) => b.compatibilidad - a.compatibilidad);

const MatchPacienteList: React.FC = () => {
   return (
    <div>
        <p className="text-[1.25em] font-bold mb-4 ml-4">Información de pacientes</p>
      {recomendados.map((p) => (
        <div key={p.id} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <img src={p.foto} alt="foto perfil nutricionista" className="w-20 h-20 rounded-full object-cover object-center bg-slate-100" />
            <article>
              <h3 className="font-bold text-[1.25em]">{p.name}</h3>
              <p className="text-gray-400">{p.profesión}</p>
              <p className="bg-[#7ECD43] text-white px-2 py-1 rounded-xl text-xs inline">Compatibilidad {p.compatibilidad}%</p>
            </article>
            <img src={cerrar} alt="cerrar" />
          </div>
          <div className="flex justify-around gap-6 p-4">
            <div className="flex items-center gap-2">
              <img src={modalidad} alt="modalidad" />
              <article>
                <p>Modalidad</p>
                <p>{p.modalidad}</p>
              </article>
            </div>
            <div className="flex items-center gap-2">
              <img src={disponibilidad} alt="disponibilidad" />
              <article>
                <p>Disponibilidad:</p>
                <p>{p.disponibilidad}</p>
              </article>
            </div>
          </div>
            <Button className="w-[90%] mx-auto mb-4">Aceptar cita</Button>
        </div>
      ))}
    </div>
  );
};

export default MatchPacienteList;
