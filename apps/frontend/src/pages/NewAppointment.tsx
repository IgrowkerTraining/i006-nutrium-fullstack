import React from "react";
import { useParams } from "react-router-dom";
import { AppointmentPage } from "../components/appointments/AppointmentPage";

const NewAppointment: React.FC = () => {
  const { nutritionistId } = useParams();

  return (
    <main className="px-6">

      <section>
        <h2 className="text-xl font-semibold">
          Agendar cita
        </h2>
        <p className="text-sm text-slate-500">
          Selecciona una fecha y hora disponible
        </p>
      </section>

      <hr className="w-screen border-t border-[#7ECD43] my-4" />

      <AppointmentPage nutritionistId={nutritionistId} />

    </main>
  );
};

export default NewAppointment;