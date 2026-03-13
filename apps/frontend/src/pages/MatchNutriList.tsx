import React from "react";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { storage } from "../utils/storage";
import modalidad from "../assets/Modalidad.png";
import disponibilidad from "../assets/Disponibilidad.png";
import cerrar from "../assets/Cerrar.png";
import { Button } from "../components/common/Button";
import AppointmentModal from "../components/common/AppointmentModal";
import AppLayout from "../components/layout/AppLayout";
import verificado from "../assets/estado=Verificado.png"
import noVerificado from "../assets/estado=noVerificado.png"
import { useNavigate, useLocation } from "react-router-dom";
import nutriBusca from "../assets/nutri_busca.png"


const MatchNutriList: React.FC = () => {
  const [nutricionistas, setNutricionistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);
  const token = storage.getToken();
  const user = storage.getUser();
  const hasRealSession = Boolean(token && user?.id);
  const hasAnyCompatibility = nutricionistas.some(
    (n: any) => n.compatibility != null && n.compatibility > 0
  );
  const showAiFallback = nutricionistas.length > 0 && (aiFailed || !hasAnyCompatibility);
  const navigate = useNavigate();
  const location = useLocation();

  const isLicenseVerified = (license: string) => /^[A-Za-z]{2}\d{4}$/.test(license);

  const formatAvailability = (n: any): string | undefined => {
    const slots = n.availabilities;
    if (!Array.isArray(slots) || slots.length === 0) return undefined;
    const first = slots[0];
    if (typeof first === "object" && first.start_time) {
      return `${first.start_time.slice(0, 5)} - ${first.end_time.slice(0, 5)}`;
    }
    return typeof first === "string" ? first : undefined;
  };

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

  const fetchBackendFallback = async () => {
    const nutritionists = await api.getNutritionists();
    if (nutritionists.length > 0) {
      const withAvailability = nutritionists.map((n: any) => ({
        ...n,
        availability: n.availability || formatAvailability(n),
      }));
      setNutricionistas(withAvailability);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(withAvailability));
    }
  };

  const enrichMatches = async (mapped: any[]) => {
    try {
      const fullList = await api.getNutritionists();
      const enriched = mapped.map((m: any) => {
        const full = fullList.find((f: any) => f.id === m.id);
        if (full) {
          return {
            ...m,
            user_id: full.user_id || m.user_id,
            license_number: full.license_number || m.license_number,
            modality: full.modality || m.modality,
            profile_picture_url: full.profile_picture_url || m.profile_picture_url,
            availability: full.availability || formatAvailability(full) || m.availability,
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
    console.log('🔍 Variables de estado:', { user, token, patientId: user?.id, role: user?.role, hasRealSession });

    // 1. Si la pantalla de carga trajo matches de IA, usarlos
    const stateMatches = (location.state as any)?.matches;
    if (Array.isArray(stateMatches)) {
      if (stateMatches.length > 0) {
        const mapped = mapMatches(stateMatches);
        setNutricionistas(mapped);
        sessionStorage.setItem("nutrium_matches", JSON.stringify(mapped));
        enrichMatches(mapped);
      } else {
        sessionStorage.removeItem("nutrium_matches");
      }
      return;
    }

    // 2. Si la pantalla de carga trajo nutricionistas del backend (fallback sin IA)
    const fallbackNutris = (location.state as any)?.fallbackNutritionists;
    if (Array.isArray(fallbackNutris)) {
      if (fallbackNutris.length > 0) {
        setNutricionistas(fallbackNutris);
        setAiFailed(true);
        sessionStorage.setItem("nutrium_matches", JSON.stringify(fallbackNutris));
      } else {
        setAiFailed(true);
        sessionStorage.removeItem("nutrium_matches");
      }
      return;
    }

    // 3. Si la pantalla de carga indicó que el servicio no está disponible
    const stateServiceUnavailable = (location.state as any)?.serviceUnavailable;
    if (stateServiceUnavailable) {
      setServiceUnavailable(true);
      return;
    }

    // 4. Si hay datos cacheados (volviendo de un perfil), usarlos
    const cached = sessionStorage.getItem("nutrium_matches");
    if (cached) {
      try {
        console.warn('⚠️ Early return [3]: sessionStorage "nutrium_matches" tiene datos, saltando fetch.', { cached });
        setNutricionistas(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 5. Acceso directo a esta URL: IA → Backend → Error
    if (!hasRealSession || !token || !user?.id) {
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
          console.warn("[MatchNutriList] Backend no disponible");
          setServiceUnavailable(true);
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

      {!hasRealSession && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          Necesitas iniciar sesión real para ver recomendaciones.
        </div>
      )}

      {serviceUnavailable && (
        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-lg text-center">
          <p className="font-semibold mb-1">Servicio no disponible</p>
          <p>En este momento nuestro servicio está fuera de servicio, disculpen las molestias.</p>
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

      {nutricionistas.map((n: any) => (
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
