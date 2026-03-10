import { Patient, Nutritionist } from "../types";

/* ============================
     PATIENT MOCK
============================ */

export const mockPatient: Patient = {
  id: "p1",
  role: "patient",
  fullName: "Iago Lema",
  email: "paciente1@email.com",
  avatarUrl: "https://previews.123rf.com/images/yupiramos/yupiramos1705/yupiramos170514716/77987175-young-man-profile-icon-vector-illustration-graphic-design.avif",

  birthDate: "1993-07-23",
  country: "España",
  city: "A Coruña",
  modality: "online",
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
  avatarUrl: "https://previews.123rf.com/images/yupiramos/yupiramos1705/yupiramos170514716/77987175-young-man-profile-icon-vector-illustration-graphic-design.avif",

  licenseNumber: "MP 4597",
  modality: "hibrido",
  availability: "Mañana",
  education: "Nutrición deportiva",
  specialization: "Alto rendimiento",
  country: "España",
  city: "A Coruña",
  qualifyingDegree: "Nutrición Clínica",
};