import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import logo from "../../assets/nutrium-logo.svg";
import animation from "../../assets/NUTRIUM-Animacion.gif"
import { api } from "../../services/api";
import { storage } from "../../utils/storage";


const MatchNutricionista: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));
    const token = storage.getToken();

    if (token) {
      const fetchAppointments = api.getMyCalendar(token);

      Promise.all([minDelay, fetchAppointments])
        .then(([, appointments]) => {
          // Extraer pacientes únicos de las citas
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
          navigate("/match/paciente-list", { state: { patients } });
        })
        .catch(() => {
          navigate("/match/paciente-list", { state: { serviceUnavailable: true } });
        });
    } else {
      minDelay.then(() => navigate("/match/paciente-list"));
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <img src={logo} alt="logo Nutrium" className="w-[60%] mx-auto block mb-8"/>
      <img src={animation} alt="animation" className="w-[80%] mx-auto block mb-10"/>
      <p className="px-3 text-center">Estamos buscando tu perfil para que los pacientes puedan encontrarte ...</p>
    </AuthLayout>
  );
};

export default MatchNutricionista;