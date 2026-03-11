import React, { useCallback, useEffect, useState } from "react";
import { AppointmentCard } from "./AppointmentCard";
import { api } from "../../services/api";
import { storage } from "../../utils/storage";
import nutriSad from "../../assets/nutri_sad.png";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  patient: { id: string; name: string; email: string };
  nutritionist: { id: string; name: string; email: string };
}

export const PatientCalendarView: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setError("No se encontró token de autenticación");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getMyCalendar(token);
      setAppointments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId: string) => {
    const token = storage.getToken();
    if (!token) return;
    try {
      await api.cancelAppointment(token, appointmentId);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Error al cancelar la cita");
    }
  };

  if (loading) {
    return <p className="text-slate-500 mt-4">Cargando citas...</p>;
  }

  if (error) {
    return <p className="text-red-500 font-medium mt-4">{error}</p>;
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-[#FF3131] font-medium">Aún no tienes citas agendadas.</p>
        <img src={nutriSad} alt="Sin citas" className="w-64 h-64 mt-4" />
      </div>
    );
  }

  return (
    <section className="space-y-4 mt-4">
      {appointments.map((a) => {
        const date = new Date(a.appointment_date + "T00:00:00");
        const month = MONTHS[date.getMonth()];
        const day = String(date.getDate());
        const time = a.start_time.slice(0, 5) + " - " + a.end_time.slice(0, 5);

        return (
          <AppointmentCard
            key={a.id}
            id={a.id}
            month={month}
            day={day}
            name={a.nutritionist.name}
            time={time}
            modality={a.notes || ""}
            status={a.status}
            onCancel={() => handleCancel(a.id)}
          />
        );
      })}
    </section>
  );
};