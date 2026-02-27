import React from "react";
import { AppointmentCard } from "./AppointmentCard";

export const PatientCalendarView: React.FC = () => {
  const appointments = [
    { month: "Mar", day: "25", name: "Dra. Laura González", time: "12:00", modality: "Virtual" },
    { month: "Apr", day: "12", name: "Pedro Gomez", time: "12:00", modality: "Virtual" },
  ];

  return (
    <section className="space-y-4 mt-4">
      {appointments.map((a, i) => (
        <AppointmentCard key={i} {...a} />
      ))}
    </section>
  );
};