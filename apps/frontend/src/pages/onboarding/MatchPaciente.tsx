import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import logo from "../../assets/nutrium-logo.svg";
import animation from "../../assets/NUTRIUM-Animacion.gif"
import { storage } from "../../utils/storage";
import { api } from "../../services/api";

const Match: React.FC = () => {
  const navigate = useNavigate();
  const token = storage.getToken();
  const user = storage.getUser();
  const hasRealSession = Boolean(token && user?.id);

  useEffect(() => {
    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    if (hasRealSession && token && user?.id) {
      const fetchWithRetries = async (): Promise<any[]> => {
        const MAX_RETRIES = 3;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await api.getPatientRecommendations(token!, user!.id);
          } catch (err: any) {
            console.warn(`[MatchPaciente] Intento ${attempt}/${MAX_RETRIES} falló:`, err.message);
            if (attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }
        throw new Error("IA no disponible tras varios intentos");
      };

      Promise.all([minDelay, fetchWithRetries()])
        .then(([, matches]) => {
          navigate("/match/nutri-list", { state: { matches } });
        })
        .catch(async (err) => {
          console.warn("[MatchPaciente] IA no disponible, cargando nutricionistas del backend:", err.message);
          try {
            const nutritionists = await api.getNutritionists();
            navigate("/match/nutri-list", { state: { fallbackNutritionists: nutritionists } });
          } catch {
            navigate("/match/nutri-list", { state: { serviceUnavailable: true } });
          }
        });
    } else {
      minDelay.then(() => navigate("/match/nutri-list"));
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={animation} alt="animation" className="w-[80%] mx-auto block mb-10"/>
      {!hasRealSession && (
        <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">
          Necesitas iniciar sesión real para ver recomendaciones.
        </div>
      )}
      <p className="px-3 text-center">Estamos buscando nutricionistas acorde a tu perfil...</p>
    </AuthLayout>
  );
};

export default Match;