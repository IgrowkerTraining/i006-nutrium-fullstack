import React, { useState } from "react";
import { DateSelector } from "./DateSelector";
import { CalendarGrid } from "./CalendarGrid";
import { TimeSlots } from "./TimeSlots";
import { AppointmentModal } from "./AppointmentModal";
import { Button } from "../common/Button";

interface Props {
  nutritionistId?: string;
}

export const AppointmentPage: React.FC<Props> = ({
  nutritionistId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(true);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    // 🔜 Aquí irá el fetch real
    setSuccess(true);
    setModalOpen(true);
  };

  return (
    <>
      <section>
        <h2 className="text-xl font-semibold">Agendar cita</h2>
        <p className="text-sm text-slate-500">
          Selecciona una fecha y hora disponible
        </p>
      </section>

      <hr className="w-screen border-t border-[#7ECD43] my-4" />

      <section className="mx-6">
        <h6 className="font-medium mb-2">Fecha</h6>

        <DateSelector
          selectedDate={selectedDate}
          isOpen={isCalendarOpen}
          onToggle={() => setIsCalendarOpen((prev) => !prev)}
        />

        {isCalendarOpen && (
          <CalendarGrid
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
          />
        )}

        <h6 className="font-medium mt-6">Horas disponibles</h6>

        <TimeSlots
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        <div className="flex flex-col gap-4 mt-8">
          <Button onClick={handleConfirm}>Confirmar</Button>
          <Button variant="outline">Cancelar</Button>
        </div>

        <AppointmentModal
          isOpen={modalOpen}
          success={success}
          message={
            success ? "" : "Descripción del error"
          }
          onClose={() => setModalOpen(false)}
        />
      </section>
    </>
  );
};