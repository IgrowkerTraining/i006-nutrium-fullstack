import React, { useCallback, useEffect, useState } from "react";
import { CalendarGrid } from "./CalendarGrid";
import { AppointmentCard } from "./AppointmentCard";
import { api } from "../../services/api";
import { storage } from "../../utils/storage";

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

export const NutritionistCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSlots, setShowSlots] = useState(false);
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

  const handleConfirm = async (appointmentId: string) => {
    const token = storage.getToken();
    if (!token) return;
    try {
      await api.confirmAppointment(token, appointmentId);
      await fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Error al confirmar la cita");
    }
  };

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

  const hasAppointments = appointments.length > 0;

  return (
    <section className="space-y-6 mt-4 px-6">

      {/* LISTA DE CITAS */}
      {loading ? (
        <p className="text-slate-500">Cargando citas...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">{error}</p>
      ) : hasAppointments ? (
        <div className="space-y-4">
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
                name={a.patient.name}
                time={time}
                modality={a.notes || ""}
                status={a.status}
                onConfirm={() => handleConfirm(a.id)}
                onCancel={() => handleCancel(a.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-red-500 font-medium">
          Aún no tienes citas agendadas
        </p>
      )}

      {/* CALENDARIO (SIEMPRE visible) */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* PRÓXIMOS TURNOS */}
      {/* <div>
        <label className="text-sm font-medium block mb-2">
          Próximos turnos
        </label>

        <button
          onClick={() => setShowSlots(prev => !prev)}
          className="w-full bg-white border rounded-xl py-3 px-4 flex justify-between items-center"
        >
          Ver turnos disponibles
          <span
            className={`transition-transform duration-200 ${
              showSlots ? "rotate-180" : ""
            }`}
          >
            ⌄
          </span>
        </button>

        {showSlots && (
          <div className="mt-3 text-sm text-slate-600">
            09:00 · 10:30 · 12:00
          </div>
        )}
      </div>
 */}
    </section>
  );
};