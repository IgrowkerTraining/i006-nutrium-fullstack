import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Match from "./MatchPaciente";

// ── Mocks ────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/api", () => ({
  api: {
    getPatientRecommendations: vi.fn(),
    getNutritionists: vi.fn(),
  },
}));

vi.mock("../../utils/storage", () => ({
  storage: {
    getToken: vi.fn(),
    getUser: vi.fn(),
  },
}));

import { api } from "../../services/api";
import { storage } from "../../utils/storage";

const mockedApi = vi.mocked(api);
const mockedStorage = vi.mocked(storage);

// ── Helpers ──────────────────────────────────────────────────────────

const renderMatch = () =>
  render(
    <MemoryRouter>
      <Match />
    </MemoryRouter>
  );

const fakeMatches = [
  { nutritionist_id: "n1", nutritionist_name: "Laura", compatibility_score: 95 },
  { nutritionist_id: "n2", nutritionist_name: "Carlos", compatibility_score: 80 },
];

const fakeNutritionists = [
  { id: "n1", user: { name: "Laura" }, bio: "Clínica" },
  { id: "n2", user: { name: "Carlos" }, bio: "Deportiva" },
];

// ── Setup ────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Helper: flush all pending timers and microtasks
const flushAll = async () => {
  // Run multiple rounds to handle chained setTimeout + Promise combos
  for (let i = 0; i < 10; i++) {
    await vi.runAllTimersAsync();
  }
};

// ── Tests ────────────────────────────────────────────────────────────

describe("MatchPaciente - pantalla de carga", () => {
  it("muestra el texto de búsqueda", () => {
    mockedStorage.getToken.mockReturnValue(null);
    mockedStorage.getUser.mockReturnValue(null);
    renderMatch();
    expect(screen.getByText(/buscando nutricionistas/i)).toBeInTheDocument();
  });

  it("muestra aviso cuando no hay sesión real", () => {
    mockedStorage.getToken.mockReturnValue(null);
    mockedStorage.getUser.mockReturnValue(null);
    renderMatch();
    expect(screen.getByText(/necesitas iniciar sesión real/i)).toBeInTheDocument();
  });

  it("no muestra aviso cuando hay sesión real", () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);
    mockedApi.getPatientRecommendations.mockResolvedValue(fakeMatches);
    renderMatch();
    expect(screen.queryByText(/necesitas iniciar sesión real/i)).not.toBeInTheDocument();
  });

  it("navega con matches de IA cuando la llamada tiene éxito", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);
    mockedApi.getPatientRecommendations.mockResolvedValue(fakeMatches);

    renderMatch();
    await flushAll();

    expect(mockNavigate).toHaveBeenCalledWith("/match/nutri-list", {
      state: { matches: fakeMatches },
    });
  });

  it("reintenta hasta 3 veces antes de usar fallback", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);

    mockedApi.getPatientRecommendations
      .mockRejectedValueOnce(new Error("AI error"))
      .mockRejectedValueOnce(new Error("AI error"))
      .mockResolvedValueOnce(fakeMatches);

    renderMatch();
    await flushAll();

    expect(mockedApi.getPatientRecommendations).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenCalledWith("/match/nutri-list", {
      state: { matches: fakeMatches },
    });
  });

  it("cae al fallback de backend cuando todos los reintentos fallan", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);

    mockedApi.getPatientRecommendations.mockRejectedValue(new Error("AI error"));
    mockedApi.getNutritionists.mockResolvedValue(fakeNutritionists);

    renderMatch();
    await flushAll();

    expect(mockedApi.getPatientRecommendations).toHaveBeenCalledTimes(3);
    expect(mockedApi.getNutritionists).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/match/nutri-list", {
      state: { fallbackNutritionists: fakeNutritionists },
    });
  });

  it("navega sin datos cuando IA y backend fallan", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);

    mockedApi.getPatientRecommendations.mockRejectedValue(new Error("AI error"));
    mockedApi.getNutritionists.mockRejectedValue(new Error("Backend error"));

    renderMatch();
    await flushAll();

    expect(mockNavigate).toHaveBeenCalledWith("/match/nutri-list");
  });

  it("navega sin sesión tras el delay mínimo", async () => {
    mockedStorage.getToken.mockReturnValue(null);
    mockedStorage.getUser.mockReturnValue(null);

    renderMatch();
    await flushAll();

    expect(mockNavigate).toHaveBeenCalledWith("/match/nutri-list");
    expect(mockedApi.getPatientRecommendations).not.toHaveBeenCalled();
  });
});
