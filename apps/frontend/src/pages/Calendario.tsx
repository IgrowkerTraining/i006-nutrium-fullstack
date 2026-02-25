import React from "react";
import { useAuth } from "../hooks/useAuth";
import { EmptyAppointments } from "../components/appointments/EmptyAppointments";
import { PatientCalendarView } from "../components/appointments/PatientCalendarView";
import { NutritionistCalendarView } from "../components/appointments/NutritionistCalendarView";

const Calendario: React.FC = () => {
  const { user } = useAuth();

  const hasAppointments = true; // luego vendrá del backend

  if (!hasAppointments) {
    return <EmptyAppointments />;
  } 

  return (
    <main>

      <section  className="px-6">
        <h2 className="text-xl font-semibold">Próximas citas</h2>
        <p className="text-sm text-slate-500">
          Estas son sus próximas citas.
        </p>
      </section>

      <hr className="w-screen border-t border-[#7ECD43] my-4" />

      <section  className="px-6">
        {user?.role === "patient" && <PatientCalendarView />}
        {user?.role === "nutritionist" && <NutritionistCalendarView />}
      </section>

    </main>
  );
};

export default Calendario;