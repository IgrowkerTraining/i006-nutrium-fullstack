import React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { storage } from "../utils/storage";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import cerrar from "../assets/Cerrar.png";
import nutricionista from "../assets/nutricionista.png";
import { Button } from "../components/common/Button";
import AppLayout from "../components/layout/AppLayout";
import verificado from "../assets/estado=Verificado.png"
import noVerificado from "../assets/estado=noVerificado.png"
import { useNavigate, useLocation } from "react-router-dom";

//Datos hardcodeados para pruebas
const mockNutricionistas = [
  {
    id: "mock-n1",
    user: { name: "Laura Gonzalez" },
    bio: "Nutrición clínica",
    license_number: "MP 4597",
    modality: "Virtual",
    years_of_experience: 5,
    profile_picture_url: nutricionista,
    tags: [
      { id: "mock-t1", name: "Nutrición clínica" },
      { id: "mock-t2", name: "Pérdida de peso" },
    ],
    compatibility: 78,
  },
  {
    id: "mock-n2",
    user: { name: "Maria Acosta" },
    bio: "Nutrición deportiva",
    license_number: "MP 1234",
    modality: "Presencial",
    years_of_experience: 3,
    profile_picture_url: nutricionista,
    tags: [{ id: "mock-t3", name: "Deportiva" }],
    compatibility: 92,
  },
];


const MatchNutriList: React.FC = () => {
  const [nutricionistas, setNutricionistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<string | null>(null); // nutritionist_id o null
  const [aptDate, setAptDate] = useState("");
  const [aptStart, setAptStart] = useState("09:00");
  const [aptEnd, setAptEnd] = useState("10:00");
  const [aptNotes, setAptNotes] = useState("");
  const [aptLoading, setAptLoading] = useState(false);
  const [aptMsg, setAptMsg] = useState<string | null>(null);
  const token = storage.getToken();
  const user = storage.getUser();
  const hasRealSession = Boolean(token && token !== "mock-token" && user?.id);
  // Prioridad: datos reales (IA o backend) → mocks como último recurso
  const displayNutricionistas = nutricionistas.length > 0 ? nutricionistas : (mockNutricionistas as any);
  const navigate = useNavigate();
  const location = useLocation();

  const mapMatches = (matches: any[]) =>
    matches.map((m: any) => ({
      id: m.nutritionist_id,
      user: { name: m.nutritionist_name },
      bio: m.reasoning || "Nutricionista recomendado",
      license_number: "",
      modality: "",
      years_of_experience: m.years_of_experience || 0,
      profile_picture_url: m.profile_picture_url,
      compatibility: m.compatibility_score ?? 0,
    }));

  // Fallback al backend: carga nutricionistas reales sin compatibilidad IA
  const fetchBackendFallback = async () => {
    const nutritionists = await api.getNutritionists();
    if (nutritionists.length > 0) {
      setNutricionistas(nutritionists);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(nutritionists));
    }
  };

  // Enriquecer matches de IA con datos del backend (matrícula, modalidad, foto)
  const enrichMatches = async (mapped: any[]) => {
    try {
      const fullList = await api.getNutritionists();
      const enriched = mapped.map((m: any) => {
        const full = fullList.find((f: any) => f.id === m.id);
        if (full) {
          return {
            ...m,
            license_number: full.license_number || m.license_number,
            modality: full.modality || m.modality,
            profile_picture_url: full.profile_picture_url || m.profile_picture_url,
          };
        }
        return m;
      });
      setNutricionistas(enriched);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(enriched));
    } catch {
      // Silencioso - se muestran sin matrícula si falla
    }
  };

  useEffect(() => {
    // 1. Si la pantalla de carga trajo matches de IA, usarlos
    const stateMatches = (location.state as any)?.matches;
    if (stateMatches && stateMatches.length > 0) {
      const mapped = mapMatches(stateMatches);
      setNutricionistas(mapped);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(mapped));
      enrichMatches(mapped);
      return;
    }

    // 2. Si la pantalla de carga trajo nutricionistas del backend (fallback sin IA)
    const fallbackNutris = (location.state as any)?.fallbackNutritionists;
    if (fallbackNutris && fallbackNutris.length > 0) {
      setNutricionistas(fallbackNutris);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(fallbackNutris));
      return;
    }

    // 3. Si hay datos cacheados (volviendo de un perfil), usarlos
    const cached = sessionStorage.getItem("nutrium_matches");
    if (cached) {
      try {
        setNutricionistas(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 4. Acceso directo a esta URL: IA → Backend → Mocks
    if (!hasRealSession || !token || !user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getPatientRecommendations(token, user.id)
      .then((matches) => {
        if (matches.length > 0) {
          const mapped = mapMatches(matches);
          setNutricionistas(mapped);
          sessionStorage.setItem("nutrium_matches", JSON.stringify(mapped));
          enrichMatches(mapped);
        }
      })
      .catch(async (err) => {
        console.warn("[MatchNutriList] IA no disponible, intentando backend:", err.message);
        try {
          await fetchBackendFallback();
        } catch (backendErr) {
          console.warn("[MatchNutriList] Backend no disponible, usando mocks");
        }
      })
      .finally(() => setLoading(false));
  }, []);
  
  const handleCreateAppointment = async () => {
    if (!token || !showModal || !aptDate) return;
    setAptLoading(true);
    setAptMsg(null);
    try {
      await api.createAppointment(token, {
        nutritionist_id: showModal,
        appointment_date: aptDate,
        start_time: aptStart,
        end_time: aptEnd,
        notes: aptNotes || undefined,
      });
      setAptMsg("Cita agendada exitosamente");
      setTimeout(() => {
        setShowModal(null);
        setAptMsg(null);
        setAptDate("");
        setAptStart("09:00");
        setAptEnd("10:00");
        setAptNotes("");
      }, 1500);
    } catch (err: any) {
      setAptMsg(err.message || "Error al agendar la cita");
    } finally {
      setAptLoading(false);
    }
  };

  return (
    <AppLayout>
      <article className="pl-4 border-b border-[#7ECD43] pb-2 mt-4">
        <h2 className="text-[1.25em] leading-[1.75em] font-bold mb-2">Listado de Nutricionistas</h2>
        <p className="text-[0.875em] leading-[1.375em]">Estos nutricionistas tienen mas compatibilidad con lo que estás buscando.</p>
      </article>
      <p className="text-[0.813em] leading-[1.25em] ml-4 mb-12">* Las recomendaciones se basan en la información proporcionada y no sustituyen evualuación médica</p>

      {!hasRealSession && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          Necesitas iniciar sesión real para ver recomendaciones.
        </div>
      )}

      {displayNutricionistas.map((n: any) => (
        <div key={n.id} onClick={() => navigate(`/perfiles-match-nutri/${n.id}`, { state: n })} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <div className="w-[83px] h-[83px] rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-slate-400">
                {n.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <article>
              <h3 className="font-semibold text-[1.125em] leading-[1.625em]">Dra./Dr. {n.user?.name || "Sin nombre"}</h3>
              <p className="text-[#6B7280] text-[0.875em] leading-[1.375em]">{n.bio || "Nutricionista"}</p>
              <div className="flex gap-3 items-center my-2">
                <img src={noVerificado} alt="no verificado" />
                <p className="text-[#6B7280] text-[0.875em] leading-[1.375em]">Matrícula: {n.license_number}</p>
              </div>
              {n.compatibility != null && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#7ECD43] text-[#FFFFFF] px-2 py-1 rounded-xl text-[0.75em] font-bold">
                    Compatibilidad: {Math.round(n.compatibility)}%
                  </span>
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
            <Button onClick={(e) => { e.stopPropagation(); setShowModal(n.user_id || n.user?.id || n.id); }} className="w-[90%] mx-auto mb-4">Agendar cita</Button>
        </div>
      ))}

      {/* Modal Agendar Cita */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Agendar cita</h3>

            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input type="date" value={aptDate} onChange={(e) => setAptDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border rounded-lg px-3 py-2 mb-3" />

            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Inicio</label>
                <input type="time" value={aptStart} onChange={(e) => setAptStart(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Fin</label>
                <input type="time" value={aptEnd} onChange={(e) => setAptEnd(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
            <input type="text" value={aptNotes} onChange={(e) => setAptNotes(e.target.value)}
              placeholder="Ej: Virtual, Presencial..."
              className="w-full border rounded-lg px-3 py-2 mb-4" />

            {aptMsg && (
              <p className={`text-sm mb-3 ${aptMsg.includes("exitosamente") ? "text-green-600" : "text-red-500"}`}>
                {aptMsg}
              </p>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setShowModal(null)} className="flex-1 bg-gray-200 text-gray-700">Cancelar</Button>
              <Button onClick={handleCreateAppointment} disabled={!aptDate || aptLoading} className="flex-1">
                {aptLoading ? "Agendando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default MatchNutriList;
