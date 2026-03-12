import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ProfileField } from "../components/profile/ProfileField";
import { AvailabilityField } from "../components/profile/AvailabilityField";
import { Button } from "../components/common/Button";
import nutricionistaDefault from "../assets/nutricionista.png";
import { api } from "../services/api";
import { storage } from "../utils/storage";

const PerfilesMatchPaciente: React.FC = () => {
  const { state: paciente } = useLocation();
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [hideButton, setHideButton] = useState(false);
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const token = storage.getToken();
    if (!token || !patientId) return;

    api.getMyCalendar(token)
      .then((appointments) => {
        const patientAppts = (appointments || []).filter(
          (a: any) => a.patient?.id === patientId
        );
        const pending = patientAppts.find((a: any) => a.status === "pending");
        if (pending) {
          setPendingAppointmentId(pending.id);
        } else if (patientAppts.length > 0) {
          setHideButton(true);
        }
      })
      .catch(() => {});
  }, [patientId]);

  const handleConfirm = async () => {
    if (!pendingAppointmentId) return;
    const token = storage.getToken();
    if (!token) return;

    setConfirming(true);
    try {
      await api.confirmAppointment(token, pendingAppointmentId);
      setHideButton(true);
      setPendingAppointmentId(null);
    } catch (err: any) {
      console.error("[PerfilesMatchPaciente] Error al confirmar:", err.message);
    } finally {
      setConfirming(false);
    }
  };

  if (!paciente) {
    return <p className="p-6">No se encontró información del paciente.</p>;
  }

  return (
    <div className="flex flex-col">
      <main className="flex-1 pb-24">
        <section className="px-6">
          <h2 className="text-xl font-semibold text-left">
            Perfil del Paciente
          </h2>
        </section>

        <hr className="w-screen border-t-1 border-[#7ECD43] my-4" />

        <section className="flex justify-center mx-6 my-[clamp(43px,10.94vw,80px)]">
          <div className="w-[clamp(260px,85vw,600px)] aspect-[334/293] rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="text-6xl text-slate-400">
              {(paciente.fullName || paciente.name)?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-4 px-6">
          <ProfileField
            label="Nombre completo"
            value={paciente.fullName || paciente.name || "Sin nombre"}
          />
          <ProfileField
            label="Fecha de nacimiento"
            value={paciente.birthDate || "No especificada"}
          />
          <ProfileField label="País" value={paciente.country || "No especificado"} />
          <ProfileField label="Ciudad" value={paciente.city || "No especificada"} />
          <ProfileField
            label="Modalidad"
            value={paciente.modalidad || paciente.modality || "No especificada"}
          />
          <AvailabilityField
            label="Disponibilidad horaria"
            value={{
              start: paciente.horarioDesde || paciente.disponibilidad?.start || "",
              end: paciente.horarioHasta || paciente.disponibilidad?.end || "",
            }}
          />
          <ProfileField
            label="Objetivo"
            value={paciente.objetivo || "No especificado"}
          />
          <ProfileField
            label="¿Padeces de alguna condición?"
            value={
              paciente.condition === "otra"
                ? paciente.conditionDetails
                : paciente.condition || "No especificada"
            }
          />
        </section>

        <section className="flex flex-col gap-4 mx-6 mt-8">
          {!hideButton && pendingAppointmentId && (
            <Button
              className="w-full rounded-2xl"
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? "Confirmando..." : "Aceptar cita"}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full rounded-2xl"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </section>
      </main>
    </div>
  );
};

export default PerfilesMatchPaciente;