import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MatchNutriList from "./MatchNutriList";

// ── Mocks ────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
let mockLocationState: any = {};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/match/nutri-list", state: mockLocationState }),
  };
});

vi.mock("../services/api", () => ({
  api: {
    getPatientRecommendations: vi.fn(),
    getNutritionists: vi.fn(),
    createAppointment: vi.fn(),
  },
}));

vi.mock("../utils/storage", () => ({
  storage: {
    getToken: vi.fn(() => null),
    getUser: vi.fn(() => null),
  },
}));

import { api } from "../services/api";
import { storage } from "../utils/storage";

const mockedApi = vi.mocked(api);
const mockedStorage = vi.mocked(storage);

// ── Helpers ──────────────────────────────────────────────────────────

const renderList = () =>
  render(
    <MemoryRouter>
      <MatchNutriList />
    </MemoryRouter>
  );

const aiMatches = [
  {
    nutritionist_id: "n1",
    nutritionist_name: "Laura González",
    compatibility_score: 95,
    reasoning: "Especialista en pérdida de peso",
    years_of_experience: 8,
    profile_picture_url: null,
  },
  {
    nutritionist_id: "n2",
    nutritionist_name: "Carlos Ruiz",
    compatibility_score: 72,
    reasoning: "Nutrición deportiva",
    years_of_experience: 3,
    profile_picture_url: null,
  },
];

const backendNutritionists = [
  {
    id: "n1",
    user: { name: "Laura González" },
    bio: "Nutrición clínica",
    license_number: "MP 4597",
    modality: "Virtual",
    years_of_experience: 5,
  },
  {
    id: "n2",
    user: { name: "Carlos Ruiz" },
    bio: "Deportiva",
    license_number: "MP 1234",
    modality: "Presencial",
    years_of_experience: 3,
  },
];

// ── Tests ────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockLocationState = {};
  sessionStorage.clear();
  mockedStorage.getToken.mockReturnValue(null);
  mockedStorage.getUser.mockReturnValue(null);
  // enrichMatches llama a getNutritionists en background
  mockedApi.getNutritionists.mockResolvedValue([]);
});

describe("MatchNutriList - listado de nutricionistas", () => {
  it("muestra el título y descripción", () => {
    renderList();
    expect(screen.getByText("Listado de Nutricionistas")).toBeInTheDocument();
    expect(screen.getByText(/tienen mas compatibilidad/i)).toBeInTheDocument();
  });

  it("muestra nutricionistas mock cuando no hay datos reales", () => {
    renderList();
    // Los mocks hardcodeados del componente: Laura Gonzalez y Maria Acosta
    expect(screen.getByText(/Laura Gonzalez/)).toBeInTheDocument();
    expect(screen.getByText(/Maria Acosta/)).toBeInTheDocument();
  });

  it("muestra aviso cuando no hay sesión real", () => {
    renderList();
    expect(screen.getByText(/necesitas iniciar sesión real/i)).toBeInTheDocument();
  });

  it("muestra matches de IA con % de compatibilidad desde navigation state", async () => {
    mockLocationState = { matches: aiMatches };
    renderList();

    await waitFor(() => {
      expect(screen.getByText(/Laura González/)).toBeInTheDocument();
      expect(screen.getByText(/Carlos Ruiz/)).toBeInTheDocument();
      expect(screen.getByText("Compatibilidad: 95%")).toBeInTheDocument();
      expect(screen.getByText("Compatibilidad: 72%")).toBeInTheDocument();
    });
  });

  it("enriquece matches de IA con matrícula del backend", async () => {
    mockedApi.getNutritionists.mockResolvedValue(backendNutritionists);
    mockLocationState = { matches: aiMatches };
    renderList();

    await waitFor(() => {
      expect(screen.getByText(/MP 4597/)).toBeInTheDocument();
      expect(screen.getByText(/MP 1234/)).toBeInTheDocument();
    });
  });

  it("muestra nutricionistas del fallback SIN % de compatibilidad", async () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    renderList();

    await waitFor(() => {
      expect(screen.getByText(/Laura González/)).toBeInTheDocument();
      expect(screen.getByText(/Carlos Ruiz/)).toBeInTheDocument();
    });
    // No debe haber badges de compatibilidad
    expect(screen.queryByText(/Compatibilidad:/)).not.toBeInTheDocument();
  });

  it("muestra experiencia en años para cada nutricionista", async () => {
    mockLocationState = { matches: aiMatches };
    renderList();

    await waitFor(() => {
      expect(screen.getByText("8 años")).toBeInTheDocument();
      expect(screen.getByText("3 años")).toBeInTheDocument();
    });
  });

  it("muestra un botón 'Agendar cita' por cada nutricionista", () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    renderList();

    const buttons = screen.getAllByText("Agendar cita");
    expect(buttons).toHaveLength(backendNutritionists.length);
  });

  it("abre el modal al hacer clic en 'Agendar cita'", async () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    const user = userEvent.setup();

    renderList();

    // No debe haber modal al inicio
    expect(screen.queryByText("Agendar cita", { selector: "h3" })).not.toBeInTheDocument();

    const buttons = screen.getAllByText("Agendar cita");
    await user.click(buttons[0]);

    // Ahora el modal debe estar visible
    expect(screen.getByText("Agendar cita", { selector: "h3" })).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("cierra el modal al hacer clic en 'Cancelar'", async () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    const user = userEvent.setup();

    renderList();

    const buttons = screen.getAllByText("Agendar cita");
    await user.click(buttons[0]);
    expect(screen.getByText("Agendar cita", { selector: "h3" })).toBeInTheDocument();

    await user.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Agendar cita", { selector: "h3" })).not.toBeInTheDocument();
  });

  it("el botón Confirmar está deshabilitado sin fecha", async () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    const user = userEvent.setup();

    renderList();

    const buttons = screen.getAllByText("Agendar cita");
    await user.click(buttons[0]);

    const confirmBtn = screen.getByText("Confirmar");
    expect(confirmBtn).toBeDisabled();
  });

  it("crea cita exitosamente y muestra mensaje de éxito", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);
    mockedApi.createAppointment.mockResolvedValue({ success: true });
    mockLocationState = { fallbackNutritionists: backendNutritionists };

    const user = userEvent.setup();
    renderList();

    const buttons = screen.getAllByText("Agendar cita");
    await user.click(buttons[0]);

    // fireEvent.change para inputs de tipo date (userEvent.type no funciona en jsdom)
    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "2026-04-15" } });

    await user.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(screen.getByText("Cita agendada exitosamente")).toBeInTheDocument();
    });
  });

  it("muestra error cuando falla la creación de cita", async () => {
    mockedStorage.getToken.mockReturnValue("real-token");
    mockedStorage.getUser.mockReturnValue({ id: "u1" } as any);
    mockedApi.createAppointment.mockRejectedValue(new Error("Horario no disponible"));
    mockLocationState = { fallbackNutritionists: backendNutritionists };

    const user = userEvent.setup();
    renderList();

    const buttons = screen.getAllByText("Agendar cita");
    await user.click(buttons[0]);

    const dateInput = document.querySelector('input[type="date"]')!;
    fireEvent.change(dateInput, { target: { value: "2026-04-15" } });

    await user.click(screen.getByText("Confirmar"));

    await waitFor(() => {
      expect(screen.getByText("Horario no disponible")).toBeInTheDocument();
    });
  });

  it("navega al perfil del nutricionista al hacer clic en la card", async () => {
    mockLocationState = { fallbackNutritionists: backendNutritionists };
    const user = userEvent.setup();

    renderList();

    // Click en el nombre del nutricionista (dentro de la card)
    await user.click(screen.getByText(/Laura González/));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/perfiles-match-nutri/n1",
      { state: expect.objectContaining({ id: "n1" }) }
    );
  });

  it("usa datos de sessionStorage cuando no hay state en navegación", () => {
    const cached = JSON.stringify(backendNutritionists);
    sessionStorage.setItem("nutrium_matches", cached);

    renderList();

    expect(screen.getByText(/Laura González/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Ruiz/)).toBeInTheDocument();
  });
});
