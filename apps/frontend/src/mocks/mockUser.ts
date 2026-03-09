import { Patient, Nutritionist } from "../types";

/* ============================
     PATIENT MOCK
============================ */

export const mockPatient: Patient = {
  id: "p1",
  role: "patient",
  fullName: "Iago Lema",
  email: "paciente1@email.com",
  avatarUrl: "https://i.pravatar.cc/300?img=32",

  birthDate: "1993-07-23",
  country: "España",
  city: "A Coruña",
  modality: "Virtual",
  availability: "Tarde",
  goal: "Perder peso",
  medicalCondition: "SIBO",
  otherConditionDescription:
    "No hay",
};

/* ============================
     NUTRITIONIST MOCK
============================ */

export const mockNutritionist: Nutritionist = {
  id: "n1",
  role: "nutritionist",
  fullName: "Iago Lema",
  email: "nutricionista1@email.com",
  avatarUrl: "https://i.pravatar.cc/300?img=47",

  licenseNumber: "MP 4597",
  modality: "Mixto",
  availability: "Mañana",
  education: "Nutrición deportiva",
  specialization: "Alto rendimiento",
  country: "España",
  city: "A Coruña",
  qualifyingDegree: "Nutrición Clínica",
};