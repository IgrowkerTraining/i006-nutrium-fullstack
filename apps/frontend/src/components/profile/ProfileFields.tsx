import React from "react";
import { Patient, Nutritionist } from "../../types";
import { ProfileField } from "./ProfileField";

type Props = {
  profile: Patient | Nutritionist;
  isEditing?: boolean;
  formData?: Record<string, any>;
  onChange?: (field: string, value: string) => void;
};

export const ProfileFields: React.FC<Props> = ({
  profile,
  isEditing = false,
  formData,
  onChange,
}) => {
  const val = (field: string) =>
    isEditing && formData ? formData[field] : (profile as any)[field];

  const handleChange = (field: string) => (value: string) => {
    onChange?.(field, value);
  };

  if (profile.role === "patient") {
    return (
      <section className="flex flex-col gap-4">
        <ProfileField
          label="Nombre completo"
          value={val("fullName")}
          isEditing={isEditing}
          onChange={handleChange("fullName")}
        />
        <ProfileField
          label="Fecha de nacimiento"
          value={val("birthDate")}
          isEditing={isEditing}
          onChange={handleChange("birthDate")}
          type="date"
        />
        <ProfileField
          label="País"
          value={val("country")}
          isEditing={isEditing}
          onChange={handleChange("country")}
        />
        <ProfileField
          label="Ciudad"
          value={val("city")}
          isEditing={isEditing}
          onChange={handleChange("city")}
        />
        <ProfileField label="Correo electrónico" value={profile.email} />
        <ProfileField
          label="Modalidad"
          value={val("modality")}
          isEditing={isEditing}
          onChange={handleChange("modality")}
          type="select"
          options={["online", "presencial", "hibrido"]}
        />
        <ProfileField
          label="Disponibilidad"
          value={val("availability")}
          isEditing={isEditing}
          onChange={handleChange("availability")}
          type="select"
          options={["Mañana", "Tarde"]}
        />
        <ProfileField
          label="Objetivo"
          value={val("goal")}
          isEditing={isEditing}
          onChange={handleChange("goal")}
          type="select"
          options={["Perder peso", "Ganar masa muscular"]}
        />
        <ProfileField
          label="¿Padeces alguna condición?"
          value={val("medicalCondition")}
          isEditing={isEditing}
          onChange={handleChange("medicalCondition")}
        />
        <ProfileField
          label="Descripción adicional"
          value={val("otherConditionDescription")}
          isEditing={isEditing}
          onChange={handleChange("otherConditionDescription")}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <ProfileField
        label="Nombre completo"
        value={val("fullName")}
        isEditing={isEditing}
        onChange={handleChange("fullName")}
      />
      <ProfileField label="Correo electrónico" value={profile.email} />
      <ProfileField
        label="Matrícula"
        value={val("licenseNumber")}
        isEditing={isEditing}
        onChange={handleChange("licenseNumber")}
      />
      <ProfileField
        label="Modalidad de atención"
        value={val("modality")}
        isEditing={isEditing}
        onChange={handleChange("modality")}
        type="select"
        options={["online", "presencial", "hibrido"]}
      />
      <ProfileField
        label="Disponibilidad"
        value={val("availability")}
        isEditing={isEditing}
        onChange={handleChange("availability")}
        type="select"
        options={["Mañana", "Tarde"]}
      />
      <ProfileField
        label="Formación"
        value={val("education")}
        isEditing={isEditing}
        onChange={handleChange("education")}
      />
      <ProfileField
        label="Especialización"
        value={val("specialization")}
        isEditing={isEditing}
        onChange={handleChange("specialization")}
      />
    </section>
  );
};
