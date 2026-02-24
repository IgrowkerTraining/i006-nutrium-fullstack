import React, { useState } from "react";
import { CalendarGrid } from "./CalendarGrid";

export const NutritionistCalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSlots, setShowSlots] = useState(false);

  return (
    <section className="space-y-6 mt-4">

      {/* Lista de citas */}
      <div>
        {/* Reutilizar AppointmentCard aquí */}
      </div>

      {/* Calendario */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Próximos turnos */}
      <div>
        <label className="text-sm font-medium block mb-2">
          Próximos turnos
        </label>

        <button
          onClick={() => setShowSlots(prev => !prev)}
          className="w-full bg-white border rounded-xl py-3 px-4 flex justify-between"
        >
          Ver turnos disponibles
          <span>⌄</span>
        </button>

        {showSlots && (
          <div className="mt-3 text-sm text-slate-600">
            {/* Aquí irán horas libres */}
            09:00 · 10:30 · 12:00
          </div>
        )}
      </div>

    </section>
  );
};