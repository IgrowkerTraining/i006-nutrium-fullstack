import React from "react";
import { useParams } from "react-router-dom";
import { AppointmentPage } from "../components/appointments/AppointmentPage";

const NewAppointment: React.FC = () => {
  const { nutritionistId } = useParams();

  return (
    <>

      <AppointmentPage nutritionistId={nutritionistId} />

    </>
  );
};

export default NewAppointment;