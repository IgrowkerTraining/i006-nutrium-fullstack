import React from "react";
import { Patient, Nutritionist } from "../../types";
import { ProfileField } from "./ProfileField";
import { AvailabilityField } from "./AvailabilityField";

type Props = {
  profile: Patient | Nutritionist;
};

export const ProfileFields: React.FC<Props> = ({ profile }) => {
  if (profile.role === "patient") {
    return (
      <section className="flex flex-col gap-4">
        <ProfileField label="Nombre completo" value={profile.fullName} />
        <ProfileField label="Fecha de nacimiento" value={profile.birthDate} />
        <ProfileField label="País" value={profile.country} />
        <ProfileField label="Ciudad" value={profile.city} />
        <ProfileField label="Correo electrónico" value={profile.email} />
        <ProfileField label="Modalidad" value={profile.modality} />
        <AvailabilityField
          label="Disponibilidad"
          value={{
            start: profile.availabilityStart,
            end: profile.availabilityEnd,
          }}
        />
        <ProfileField label="Objetivo" value={profile.goal} />
        <ProfileField label="¿Padeces alguna condición?" value={profile.medicalCondition} />
        <ProfileField label="Descripción adicional" value={profile.otherConditionDescription} />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
        <ProfileField label="Nombre completo" value={profile.fullName} />
        <ProfileField label="Correo electrónico" value={profile.email} />
        <ProfileField label="Matrícula" value={profile.licenseNumber} />
        <ProfileField label="Modalidad de atención" value={profile.modality} />
        <AvailabilityField
          label="Disponibilidad horaria"
          value={{
            start: profile.availabilityStart,
            end: profile.availabilityEnd,
          }}
        />
        <ProfileField label="Formación" value={profile.education} />
        <ProfileField label="Especialización" value={profile.specialization} />
    </section>
  );
};