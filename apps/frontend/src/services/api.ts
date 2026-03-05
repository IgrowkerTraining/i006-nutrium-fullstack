import { User } from "../types";
import { API_ENDPOINTS } from "../constants/routes";
import { mockNutritionist, mockPatient } from "../mocks/mockUser";

const readJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const useMocks =
  typeof import.meta !== "undefined" &&
  (import.meta as any).env &&
  String((import.meta as any).env.VITE_USE_MOCKS).toLowerCase() === "true";

export const api = {
  async register(data: any): Promise<{ user: User; message: string }> {
    if (useMocks) {
      const user: User = data?.role === "patient" ? mockPatient : mockNutritionist;
      return {
        user,
        message: "Mock register",
      };
    }
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
    if (useMocks) {
      const storedRole = localStorage.getItem("nutrium_role");
      const role = storedRole === "patient" || storedRole === "nutritionist"
        ? storedRole
        : undefined;
      const user: User =
        role === "patient"
          ? mockPatient
          : role === "nutritionist"
            ? mockNutritionist
            : String(data?.email || "").toLowerCase().includes("nutri")
              ? mockNutritionist
              : mockPatient;

      return {
        user,
        token: "mock-token",
        message: "Mock login",
      };
    }
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
      user: result?.data?.user,
      token: result?.data?.token,
      message: result?.message,
    };
  },

  async checkHealth(): Promise<boolean> {
    if (useMocks) return true;
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
    if (useMocks) {
      return [
        {
          id: "n1",
          user: { name: mockNutritionist.fullName },
          bio: mockNutritionist.specialization,
          license_number: mockNutritionist.licenseNumber,
          modality: mockNutritionist.modality,
          years_of_experience: 5,
          profile_picture_url: mockNutritionist.avatarUrl,
          tags: [
            { id: "t1", name: "Nutrición deportiva" },
            { id: "t2", name: "Alto rendimiento" },
          ],
        },
        {
          id: "n2",
          user: { name: "Dra./Dr. Demo" },
          bio: "Nutrición clínica",
          license_number: "MP 1234",
          modality: "Virtual",
          years_of_experience: 3,
          profile_picture_url: mockNutritionist.avatarUrl,
          tags: [{ id: "t3", name: "Clínica" }],
        },
      ];
    }
    const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}`;
    const response = await fetch(url);
    const result = await readJsonSafely(response);
    if (!response.ok) {
      throw new Error(result?.message || "Error al obtener nutricionistas");
    }
    return result?.data?.nutritionists || [];
  },

  async createNutritionistProfile(token: string, data: any): Promise<any> {
  if (useMocks) {
    return {
      data: {
        nutritionist: {
          ...data,
          id: mockNutritionist.id,
        },
      },
      message: "Mock profile updated",
    };
  }
  const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.NUTRITIONISTS}/profile`;
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
    throw new Error(result?.message || "Error al crear perfil");
  }
  return result;
},

};

