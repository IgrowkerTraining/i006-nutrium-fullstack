export type UserRole = "patient" | "nutritionist";

interface BaseUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Patient extends BaseUser {
  role: "patient";

  birthDate: string;
  country: string;
  city: string;
  modality: "Virtual" | "Presencial" | "Mixto";
  availability: "Mañana" | "Tarde";
  goal: "Perder peso" | "Ganar masa muscular";
  medicalCondition: string;
  otherConditionDescription: string;
}

export interface Nutritionist extends BaseUser {
  role: "nutritionist";

  licenseNumber: string; // Matrícula
  modality: "Virtual" | "Presencial" | "Mixto";
  availability: "Mañana" | "Tarde";
  education: string; // Formación
  specialization: string;

  // No utilizados en perfil
  country: string;
  city: string;
  qualifyingDegree: string;
}

export type User = Patient | Nutritionist;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// export enum AuthView {
//   LOGIN = "LOGIN",
//   REGISTER = "REGISTER",
//   DASHBOARD = "DASHBOARD",
// }
