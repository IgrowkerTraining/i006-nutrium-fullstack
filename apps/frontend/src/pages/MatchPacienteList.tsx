import React, { useState, useEffect } from "react";
import cerrar from "../assets/Cerrar.png";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import { Button } from "../components/common/Button";
import AppLayout from "../components/layout/AppLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { storage } from "../utils/storage";

const MatchPacienteList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [hideButtonIds, setHideButtonIds] = useState<Set<string>>(new Set());
  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  // Ocultar botón solo si el paciente NO tiene ninguna cita pending
  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;

    api.getMyCalendar(token)
      .then((appointments) => {
        const hasPending = new Set<string>();
        const allPatientIds = new Set<string>();
        (appointments || []).forEach((a: any) => {
          if (!a.patient) return;
          allPatientIds.add(a.patient.id);
          if (a.status === "pending") {
            hasPending.add(a.patient.id);
          }
        });
        // Ocultar botón para pacientes que tienen citas pero ninguna pending
        const hide = new Set<string>();
        allPatientIds.forEach((id) => {
          if (!hasPending.has(id)) hide.add(id);
        });
        setHideButtonIds(hide);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 1. Si la pantalla de carga trajo pacientes del backend
    const statePatients = (location.state as any)?.patients;
    if (statePatients && statePatients.length > 0) {
      setPacientes(statePatients);
      sessionStorage.setItem("nutrium_patient_matches", JSON.stringify(statePatients));
      return;
    }

    // 2. Si la pantalla de carga indicó que el servicio no está disponible
    const stateServiceUnavailable = (location.state as any)?.serviceUnavailable;
    if (stateServiceUnavailable) {
      setServiceUnavailable(true);
      return;
    }

    // 3. Si hay datos cacheados (volviendo de un perfil)
    const cached = sessionStorage.getItem("nutrium_patient_matches");
    if (cached) {
      try {
        setPacientes(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 4. Acceso directo: intentar cargar desde citas del backend
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
      .catch(() => {
        console.warn("[MatchPacienteList] Backend no disponible");
        setServiceUnavailable(true);
      });
  }, []);

  return (
    <AppLayout>
        <p className="text-[1.25em] font-bold mb-4 ml-4">Información de pacientes</p>

      {serviceUnavailable && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg text-center">
          <p className="font-semibold mb-1">Servicio no disponible</p>
          <p>En este momento nuestro servicio está fuera de servicio, disculpen las molestias.</p>
        </div>
      )}

      {!serviceUnavailable && pacientes.length === 0 && (
        <div className="mx-4 mb-4 text-center text-slate-500 text-sm p-4">
          <p>No se encontraron pacientes.</p>
        </div>
      )}

      {pacientes.map((p: any) => (
        <div key={p.id} onClick={() => navigate(`/perfiles-match-paciente/${p.id}`, { state: p })} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <div className="w-[83px] h-[83px] rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-slate-400">
                {p.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
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
            {!hideButtonIds.has(p.id) && (
              <Button className="w-[90%] mx-auto mb-4">Aceptar cita</Button>
            )}
        </div>
      ))}
    </AppLayout>
  );
};

export default MatchPacienteList;
