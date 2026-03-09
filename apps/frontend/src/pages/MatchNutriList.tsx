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
  const token = storage.getToken();
  const user = storage.getUser();
  const hasRealSession = Boolean(token && token !== "mock-token" && user?.id);
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

  useEffect(() => {
    // 1. Si la pantalla de carga ya trajo los matches, usarlos y guardar en cache
    const stateMatches = (location.state as any)?.matches;
    if (stateMatches && stateMatches.length > 0) {
      const mapped = mapMatches(stateMatches);
      setNutricionistas(mapped);
      sessionStorage.setItem("nutrium_matches", JSON.stringify(mapped));
      return;
    }

    // 2. Si hay matches cacheados (volviendo de un perfil), usarlos
    const cached = sessionStorage.getItem("nutrium_matches");
    if (cached) {
      try {
        setNutricionistas(JSON.parse(cached));
        return;
      } catch { /* ignorar cache corrupto */ }
    }

    // 3. Fallback: si se accede directo a esta URL, llamar a la API
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
        }
      })
      .catch((err) => {
        console.warn("[MatchNutriList] Failed to load recommendations:", err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);
  
  /* const recomendados = [...nutricionistas] //hacemos spread para no mutar el array original
    .sort((a, b) => b.compatibilidad - a.compatibilidad); */

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
        <div key={n.id} onClick={() => navigate(`/perfiles-match/${n.id}`, { state: n })} className="bg-white shadow-sm border-gray-300 border-b-4 border-x-2 mb-4 mx-4 rounded-2xl">
          <div className="flex items-start justify-between p-4">
            <img src={n.profile_picture_url || nutricionista} alt="foto perfil nutricionista" className="w-[83px] h-[83px] rounded-full object-cover object-center bg-slate-100" />
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
            <Button onClick={(e) => e.stopPropagation()} className="w-[90%] mx-auto mb-4">Agendar cita</Button>
        </div>
      ))}
    </AppLayout>
  );
};

export default MatchNutriList;
