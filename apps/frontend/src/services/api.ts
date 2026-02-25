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
      user: result?.data?.user,
      token: result?.data?.token,
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
};
