import { User } from "../types";
import { API_ENDPOINTS } from "../constants/routes";

const readJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const api = {
  async register(data: any): Promise<{ user: User; message: string }> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.AUTH.REGISTER}`;
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const result = await readJsonSafely(response);
    if (!response.ok) {
      console.error("API register error", {
        url,
        status: response.status,
        statusText: response.statusText,
        response: result,
      });
      throw new Error(
        `${response.status} ${result?.message || response.statusText || "Registration failed"}`,
      );
    }

    return {
      user: result?.data?.user,
      message: result?.message,
    };
  },

  async login(
    data: any,
  ): Promise<{ user: User; token: string; message: string }> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.AUTH.LOGIN}`;
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    const result = await readJsonSafely(response);
    if (!response.ok) {
      console.error("API login error", {
        url,
        status: response.status,
        statusText: response.statusText,
        response: result,
      });
      throw new Error(
        `${response.status} ${result?.message || response.statusText || "Login failed"}`,
      );
    }

      return {
      user: result?.data?.user || result?.user,
      token: result?.data?.token || result?.token,
      message: result?.message,
    };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE}${API_ENDPOINTS.HEALTH}`,
      );
      return response.ok;
    } catch {
      return false;
    }
  },

  async getNutritionists(): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}`;
    const response = await fetch(url);
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al obtener nutricionistas");
    }
    return result?.data?.nutritionists || [];
  },

  async createNutritionistProfile(token: string, data: any): Promise<any> {
  const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}/profile`;
  console.log("[createNutritionistProfile] Sending payload:", JSON.stringify(data, null, 2));
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await readJsonSafely(response);
  if (!response.ok) {
    console.error("[createNutritionistProfile] Backend error:", {
      status: response.status,
      statusText: response.statusText,
      body: result,
    });
    const missingFields = result?.data?.missing_fields;
    if (Array.isArray(missingFields) && missingFields.length > 0) {
      throw new Error(`${result?.message || "Faltan campos obligatorios"}: ${missingFields.join(", ")}`);
    }

    const validationErrors = result?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const messages = validationErrors
        .map((e: any) => {
          if (typeof e === "string") return e;
          if (typeof e?.message === "string") return e.message;
          return null;
        })
        .filter(Boolean);
      if (messages.length > 0) {
        throw new Error(messages.join(" | "));
      }
    }

    throw new Error(result?.message || "Error al crear perfil");
  }
  return result;
},

  async upsertPatientProfile(token: string, data: any): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PATIENTS.PROFILE}`;
    console.log("[upsertPatientProfile] Sending payload:", JSON.stringify(data, null, 2));
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al guardar el perfil del paciente");
    }
    return result;
  },

  async getPatientRecommendations(token: string, patientUserId: string): Promise<any[]> {
    const url = `${API_ENDPOINTS.BASE}/patients/${patientUserId}/recommendations`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      console.error("[getPatientRecommendations] Error:", { status: response.status, body: result });
      throw new Error(result?.message || "Error al obtener recomendaciones");
    }
    return result?.data || [];
  },

  async getMyCalendar(token: string): Promise<any[]> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.APPOINTMENTS.MY_CALENDAR}`;
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al obtener el calendario");
    }
    return result?.data?.appointments || [];
  },

  async confirmAppointment(token: string, appointmentId: string): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.APPOINTMENTS.CONFIRM(appointmentId)}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al confirmar la cita");
    }
    return result;
  },

  async cancelAppointment(token: string, appointmentId: string): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId)}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al cancelar la cita");
    }
    return result;
  },

  async getNutritionistProfile(token: string): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}/profile`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al obtener el perfil del nutricionista");
    }
    return result;
  },

  async createAppointment(token: string, data: {
    nutritionist_id: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.APPOINTMENTS.BASE}`;
    console.log('📦 Payload enviado a la cita:', data);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      // Log del cuerpo completo para diagnosticar en DevTools sin abrir Network tab
      console.error('❌ Backend response createAppointment:', result);
      // Surface field-level errors from the backend (e.g. missing/invalid fields)
      const fieldErrors: string[] = result?.data?.errors
        ? (Array.isArray(result.data.errors)
            ? result.data.errors.map((e: any) => typeof e === 'string' ? e : `${e.field}: ${e.message}`)
            : [String(result.data.errors)])
        : [];
      const detail = fieldErrors.length ? ` (${fieldErrors.join(', ')})` : '';
      throw new Error((result?.message || "Error al agendar la cita") + detail);
    }
    return result;
  },

  async getPatientProfile(token: string): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.PATIENTS.PROFILE}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al obtener el perfil del paciente");
    }
    return result;
  },

  async setAvailability(token: string, slots: { day_of_week: number; start_time: string; end_time: string }[]): Promise<any> {
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}/availability`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ slots }),
    });
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al guardar la disponibilidad");
    }
    return result;
  },

};
