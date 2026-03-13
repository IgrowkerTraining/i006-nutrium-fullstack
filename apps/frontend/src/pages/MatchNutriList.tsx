import React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { storage } from "../utils/storage";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import cerrar from "../assets/Cerrar.png";
import nutricionista from "../assets/nutricionista.png";
import { Button } from "../components/common/Button";
import AppointmentModal from "../components/common/AppointmentModal";
import AppLayout from "../components/layout/AppLayout";
import verificado from "../assets/estado=Verificado.png"
import noVerificado from "../assets/estado=noVerificado.png"
import { useNavigate, useLocation } from "react-router-dom";
import nutriBusca from "../assets/nutri_busca.png"

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
  const [aiFailed, setAiFailed] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null); // nutritionist_id o null
  const token = storage.getToken();
  const user = storage.getUser();
  const hasRealSession = Boolean(token && token !== "mock-token" && user?.id);
  // Prioridad: datos reales (IA o backend) → mocks como último recurso
  const displayNutricionistas = nutricionistas.length > 0 ? nutricionistas : (mockNutricionistas as any);
  const hasAnyCompatibility = displayNutricionistas.some(
    (n: any) => n.compatibility != null && n.compatibility > 0
  );
  const showAiFallback = aiFailed || !hasAnyCompatibility;
  const navigate = useNavigate();
  const location = useLocation();

  const isLicenseVerified = (license: string) => /^[A-Za-z]{2}\d{4}$/.test(license);

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
    } catch (enrichErr) {
      console.error("[MatchNutriList] No se pudo enriquecer con datos del backend:", enrichErr);
    }
  };

  useEffect(() => {
    console.log('🚀 Iniciando fetch de matches...');
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
      setAiFailed(true);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(fallbackNutris));
      return;
    }

    // 3. Si hay datos cacheados (volviendo de un perfil), usarlos
    const cached = sessionStorage.getItem("nutrium_matches");
    if (cached) {
      try {
        console.log('[MatchNutriList] Usando datos cacheados de sessionStorage (no se llama a la IA)');
        setNutricionistas(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 4. Acceso directo a esta URL: IA → Backend → Mocks
    if (!hasRealSession) {
      console.error('[MatchNutriList] No hay sesión real activa, se omite la llamada a la IA.');
      setLoading(false);
      return;
    }
    if (!token) {
      console.error('[MatchNutriList] Falta el token de autenticación, no se puede consultar a la IA.');
      setLoading(false);
      return;
    }
    if (!user?.id) {
      console.error('[MatchNutriList] Falta el ID del paciente, no se puede consultar a la IA.');
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getPatientRecommendations(token, user.id)
      .then(async (matches) => {
        console.log('📦 Datos recibidos de la API:', matches);
        if (matches.length > 0) {
          const mapped = mapMatches(matches);
          setNutricionistas(mapped);
          sessionStorage.setItem("nutrium_matches", JSON.stringify(mapped));
          enrichMatches(mapped);
        } else {
          setAiFailed(true);
          await fetchBackendFallback();
        }
      })
      .catch(async (err) => {
        console.error("[MatchNutriList] IA no disponible, intentando backend:", err);
        setAiFailed(true);
        try {
          await fetchBackendFallback();
        } catch (backendErr) {
          console.error("[MatchNutriList] Backend no disponible, se muestran datos de ejemplo:", backendErr);
          setError("No se pudieron cargar las recomendaciones. Verifica tu conexión o inicia sesión nuevamente.");
        }
      })
      .finally(() => setLoading(false));
  }, []);
  
  return (
    <AppLayout>
      <article className="pl-4 border-b border-[#7ECD43] pb-2 mt-4">
        <h2 className="text-[1.25em] leading-[1.75em] font-bold mb-2">Listado de Nutricionistas</h2>
        <p className="text-[0.875em] leading-[1.375em]">Estos nutricionistas tienen mas compatibilidad con lo que estás buscando.</p>
      </article>
      <p className="text-[0.813em] leading-[1.25em] ml-4 mb-12">* Las recomendaciones se basan en la información proporcionada y no sustituyen evualuación médica</p>

      {loading && (
        <div className="mx-4 mb-4 text-center text-sm text-gray-500 py-6">
          Cargando recomendaciones...
        </div>
      )}

      {error && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-300 text-red-700 text-sm p-4 rounded-lg">
          <p className="font-semibold mb-1">Error al cargar los datos</p>
          <p>{error}</p>
          <button
            className="mt-2 underline text-red-600 text-xs"
            onClick={() => { setError(null); window.location.reload(); }}
          >
            Reintentar
          </button>
        </div>
      )}

      {!hasRealSession && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          Necesitas iniciar sesión real para ver recomendaciones.
        </div>
      )}

      {!loading && !error && hasRealSession && nutricionistas.length === 0 && (
        <div className="mx-4 mt-8 flex flex-col items-center text-center gap-3">
          <img src={nutriBusca} alt="sin resultados" className="w-40 h-40 opacity-70" />
          <p className="text-[1em] font-semibold text-gray-600">
            No se encontraron recomendaciones en este momento.
          </p>
          <p className="text-[0.875em] text-gray-500">
            Revisa tu perfil o intenta más tarde.
          </p>
        </div>
      )}

      {showAiFallback && (
        <div className="text-center">
          <p className="text-[0.85em] mb-1 text-[#FF3131]">
            No se ha encontrado ningún nutricionista basado en tu perfil.
          </p>
          <img src={nutriBusca} alt="nutri está buscando" className="mx-auto w-48 h-48 mt-2 mb-4" />
          <p className="text-[0.85em] leading-[1.4em] mb-4 border-b border-[#7ECD43] pb-2">
            Recomendamos nutricionistas más populares.
          </p>
        </div>
      )}

      {displayNutricionistas.map((n: any) => (
        <div key={n.id} onClick={() => navigate(`/perfiles-match-nutri/${n.id}`, { state: n })} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <div className="w-[83px] h-[83px] rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {n.profile_picture_url ? (
                <img src={n.profile_picture_url} alt={n.user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400">
                  {n.user?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <article>
              <h3 className="font-semibold text-[1.125em] leading-[1.625em]">Dra./Dr. {n.user?.name || "Sin nombre"}</h3>
              <p className="text-[#6B7280] text-[0.875em] leading-[1.375em]">{n.bio || "Nutricionista"}</p>
              <div className="flex gap-3 items-center my-2">
                <img
                  src={isLicenseVerified(n.license_number) ? verificado : noVerificado}
                  alt={isLicenseVerified(n.license_number) ? "verificado" : "no verificado"}
                />
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
        <AppointmentModal
          nutritionistId={showModal}
          onClose={() => setShowModal(null)}
        />
      )}
    </AppLayout>
  );
};

export default MatchNutriList;
