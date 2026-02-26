import React, { useState } from "react";
import { CalendarGrid } from "./CalendarGrid";
// import { AppointmentCard } from "./AppointmentCard"; // cuando haya backend

export const NutritionistCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSlots, setShowSlots] = useState(false);

  /* ============================
     🔹 Simulación backend
  ============================ */
  const appointments = []; // ← cuando conectes backend vendrá aquí

  const hasAppointments = appointments.length > 0;

  return (
    <section className="space-y-6 mt-4 px-6">

      {/* ============================
           LISTA DE CITAS
      ============================ */}
      {hasAppointments ? (
        <div className="space-y-4">
          {/* Aquí irán las AppointmentCard */}
          {/* appointments.map(...) */}
        </div>
      ) : (
        <p className="text-red-500 font-medium">
          Aún no tienes citas agendadas
        </p>
      )}

      {/* ============================
           CALENDARIO (SIEMPRE visible)
      ============================ */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* ============================
           PRÓXIMOS TURNOS
      ============================ */}
      <div>
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
            {/* Aquí irán horas libres reales */}
            09:00 · 10:30 · 12:00
          </div>
        )}
      </div>

    </section>
  );
};