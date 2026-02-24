import React from "react";
import noAppointment from "../../assets/noAppointment.svg";

export const EmptyAppointments: React.FC = () => (
  <section className="text-center mt-[clamp(100px,30vw,160px)]">
    <h5 className="text-red-500">
      Aún no tienes citas agendadas.
    </h5>

    <img
      src={noAppointment}
      alt="Sin citas"
      className="mt-6 h-[clamp(280px,89vw,500px)] w-auto mx-auto"
    />
  </section>
);