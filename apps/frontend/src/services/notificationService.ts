import { Notification } from "../types";
import { api } from "./api";
import { storage } from "../utils/storage";

interface AppointmentData {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  patient: { id: string; name: string; email: string };
  nutritionist: { id: string; name: string; email: string };
}

// Formatea "2026-03-25" → "25/03"
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

// Compara citas anteriores con actuales y genera notificaciones
function detectChanges(
  oldAppts: AppointmentData[],
  newAppts: AppointmentData[],
  userRole: string
): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date().toISOString();

  // Mapa de citas anteriores por id para buscar rápido
  const oldMap = new Map(oldAppts.map((a) => [a.id, a]));

  for (const appt of newAppts) {
    const old = oldMap.get(appt.id);
    // El "otro" es la persona con quien tienes la cita
    const otherName =
      userRole === "patient" ? appt.nutritionist.name : appt.patient.name;
    const fecha = formatDate(appt.appointment_date);

    if (!old) {
      // Cita nueva que antes no existía
      notifications.push({
        id: `new-${appt.id}`,
        type: "info",
        message: `Nueva cita con ${otherName} el ${fecha}.`,
        read: false,
        createdAt: now,
      });
    } else if (old.status !== appt.status) {
      // El status cambió
      if (appt.status === "cancelled") {
        notifications.push({
          id: `cancel-${appt.id}`,
          type: "error",
          message: `${otherName} canceló la cita del ${fecha}.`,
          read: false,
          createdAt: now,
        });
      } else if (appt.status === "confirmed") {
        notifications.push({
          id: `confirm-${appt.id}`,
          type: "info",
          message: `${otherName} confirmó la cita del ${fecha}.`,
          read: false,
          createdAt: now,
        });
      }
    }
  }

  // Detectar citas que desaparecieron (el backend ya no las devuelve → probablemente canceladas)
  const newMap = new Map(newAppts.map((a) => [a.id, a]));
  for (const oldAppt of oldAppts) {
    if (!newMap.has(oldAppt.id) && oldAppt.status !== "cancelled") {
      const otherName =
        userRole === "patient" ? oldAppt.nutritionist.name : oldAppt.patient.name;
      const fecha = formatDate(oldAppt.appointment_date);
      notifications.push({
        id: `cancel-${oldAppt.id}`,
        type: "error",
        message: `${otherName} canceló la cita del ${fecha}.`,
        read: false,
        createdAt: now,
      });
    }
  }

  return notifications;
}

// Función principal: busca citas, compara, genera y guarda notificaciones
export async function checkForNewNotifications(
  token: string,
  userId: string,
  userRole: string
): Promise<Notification[]> {
  // 1. Traer citas actuales del backend
  const currentAppts: AppointmentData[] = await api.getMyCalendar(token);

  // 2. Leer snapshot anterior de localStorage
  const previousAppts: AppointmentData[] = storage.getAppointmentSnapshot(userId);

  // 3. Primera vez (no hay snapshot): generar notificaciones para citas activas
  const isFirstTime = localStorage.getItem(`appointments_${userId}`) === null;
  if (isFirstTime) {
    const now = new Date().toISOString();
    const firstTimeNotifs: Notification[] = currentAppts
      .filter((a) => a.status === "pending" || a.status === "confirmed" || a.status === "cancelled")
      .map((appt) => {
        const otherName =
          userRole === "patient" ? appt.nutritionist.name : appt.patient.name;
        const fecha = formatDate(appt.appointment_date);
        let message: string;
        let id: string;
        let type: "info" | "error" = "info";
        if (appt.status === "cancelled") {
          message = `${otherName} canceló la cita del ${fecha}.`;
          id = `cancel-${appt.id}`;
          type = "error";
        } else if (appt.status === "confirmed") {
          message = `${otherName} confirmó la cita del ${fecha}.`;
          id = `confirm-${appt.id}`;
        } else {
          message = `Nueva cita con ${otherName} el ${fecha}.`;
          id = `new-${appt.id}`;
        }
        return {
          id,
          type,
          message,
          read: false,
          createdAt: now,
        };
      });
    storage.setAppointmentSnapshot(userId, currentAppts);
    storage.setNotifications(userId, firstTimeNotifs);
    return firstTimeNotifs;
  }

  // 4. Leer notificaciones existentes (las que ya tenía el usuario)
  const existingNotifs = storage.getNotifications(userId);

  // 5. Detectar cambios y generar nuevas notificaciones
  const newNotifs = detectChanges(previousAppts, currentAppts, userRole);

  // 6. Filtrar duplicadas (si ya existe una notificación con el mismo id, no la agrego)
  const existingIds = new Set(existingNotifs.map((n) => n.id));
  const uniqueNewNotifs = newNotifs.filter((n) => !existingIds.has(n.id));

  // 7. Combinar: nuevas primero, luego las existentes
  const allNotifs = [...uniqueNewNotifs, ...existingNotifs];

  // 8. Guardar todo en localStorage
  storage.setAppointmentSnapshot(userId, currentAppts);
  storage.setNotifications(userId, allNotifs);

  return allNotifs;
}
