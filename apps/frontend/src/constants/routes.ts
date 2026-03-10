export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HOME: '/',
  CUESTIONARIO_PERSONAL: '/cuestionario-personal',
  CUESTIONARIO_SALUD: '/cuestionario-salud',
  MATCH_PACIENTE: '/match-paciente',
  MATCH_NUTRICIONISTA: '/match-nutricionista',
  MATCH: '/match',
  MATCH_NUTRI_LIST: '/match/nutri-list',
  MATCH_PACIENTE_LIST: '/match/paciente-list',
  PERFIL: '/perfil',
  CALENDARIO: '/calendario',
  RECUPERAR_PASSWORD: '/recuperar-password',
  LANDING_ACCESO: '/landing-acceso',
  TERMINOS_Y_CONDICIONES: '/terminos-y-condiciones',
  HOME_PAGE: '/home-page',
  PERFILES_MATCH_NUTRICIONISTA: '/perfiles-match-nutri',
  PERFILES_MATCH_PACIENTE: '/perfiles-match-paciente',
} as const;

export const API_ENDPOINTS = {
  BASE: 'http://localhost:3000/api/v1',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  HEALTH: '/health',
  PATIENTS: {
    PROFILE: '/patients/profile',
  },
  NUTRITIONISTS: '/nutritionists',
  APPOINTMENTS: {
    BASE: '/appointments',
    MY_CALENDAR: '/appointments/my-calendar',
    CONFIRM: (id: string) => `/appointments/${id}/confirm`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
  },
} as const;

export const STORAGE_KEYS = {
  USER: 'example_user',
  TOKEN: 'example_token',
} as const;
