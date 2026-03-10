import React, { useState, useEffect } from "react";
import paciente1 from "../assets/paciente1.png";
import paciente2 from "../assets/paciente2.jpg";
import cerrar from "../assets/Cerrar.png";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import { Button } from "../components/common/Button";
import AppLayout from "../components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { storage } from "../utils/storage";

// Datos mock como último recurso
const mockPacientes = [
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

const MatchPacienteList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pacientes, setPacientes] = useState<any[]>([]);

  useEffect(() => {
    // 1. Si la pantalla de carga trajo pacientes del backend
    const statePatients = (location.state as any)?.patients;
    if (statePatients && statePatients.length > 0) {
      setPacientes(statePatients);
      sessionStorage.setItem("nutrium_patient_matches", JSON.stringify(statePatients));
      return;
    }

    // 2. Si hay datos cacheados (volviendo de un perfil)
    const cached = sessionStorage.getItem("nutrium_patient_matches");
    if (cached) {
      try {
        setPacientes(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 3. Acceso directo: intentar cargar desde citas del backend
    const token = storage.getToken();
    if (!token) return;

    api.getMyCalendar(token)
      .then((appointments) => {
        const uniquePatients = new Map<string, any>();
        (appointments || []).forEach((a: any) => {
          if (a.patient && !uniquePatients.has(a.patient.id)) {
            uniquePatients.set(a.patient.id, {
              id: a.patient.id,
              name: a.patient.name,
              email: a.patient.email,
              modalidad: a.notes || "No especificada",
              disponibilidad: a.start_time?.slice(0, 5) || "",
            });
          }
        });
        const patients = Array.from(uniquePatients.values());
        if (patients.length > 0) {
          setPacientes(patients);
          sessionStorage.setItem("nutrium_patient_matches", JSON.stringify(patients));
        }
      })
      .catch((err) => {
        console.warn("[MatchPacienteList] Backend no disponible, usando mocks:", err.message);
      });
  }, []);

  // Prioridad: datos reales → mocks como último recurso
  const displayPacientes = pacientes.length > 0 ? pacientes : mockPacientes;

  return (
    <AppLayout>
        <p className="text-[1.25em] font-bold mb-4 ml-4">Información de pacientes</p>

      {displayPacientes.map((p: any) => (
        <div key={p.id} onClick={() => navigate(`/perfiles-match-paciente/${p.id}`, { state: p })} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <img src={p.foto || paciente1} alt="foto perfil paciente" className="w-[83px] h-[83px] rounded-full object-cover object-center bg-slate-100" />
            <article>
              <h3 className="font-bold text-[1.25em]">{p.name}</h3>
              {p.profesión && <p className="text-gray-400">{p.profesión}</p>}
              {p.compatibilidad != null && (
                <p className="bg-[#7ECD43] text-white px-2 py-1 rounded-xl text-xs inline">Compatibilidad {p.compatibilidad}%</p>
              )}
            </article>
            <img src={cerrar} alt="cerrar" />
          </div>
          <div className="flex justify-around gap-6 p-4">
            <div className="flex items-center gap-2">
              <img src={modalidad} alt="modalidad" />
              <article>
                <p>Modalidad</p>
                <p>{p.modalidad || "No especificada"}</p>
              </article>
            </div>
            <div className="flex items-center gap-2">
              <img src={disponibilidad} alt="disponibilidad" />
              <article>
                <p>Disponibilidad:</p>
                <p>{p.disponibilidad || "No especificada"}</p>
              </article>
            </div>
          </div>
            <Button className="w-[90%] mx-auto mb-4">Aceptar cita</Button>
        </div>
      ))}
    </AppLayout>
  );
};

export default MatchPacienteList;
