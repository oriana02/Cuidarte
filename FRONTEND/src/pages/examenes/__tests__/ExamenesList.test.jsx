import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ExamenesList from "../ExamenesList";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

// Mockeamos componentes hijos
vi.mock("../ExamenesTabList", () => ({
  default: ({ items }) => (
    <div data-testid="tabla-examenes">Tabla con {items.length} exámenes</div>
  ),
}));
vi.mock("../ExamenForm", () => ({
  default: ({ examenId }) => (
    <div data-testid="form-examen">Formulario (ID: {examenId || "nuevo"})</div>
  ),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", () => ({
  api: { get: vi.fn() },
}));

describe("ExamenesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra título "Mis Exámenes" si el rol es paciente', async () => {
    useAuth.mockReturnValue({ role: "paciente" });
    api.get.mockResolvedValue({ data: [] });
    render(
      <MemoryRouter>
        <ExamenesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Mis Exámenes Médicos")).toBeInTheDocument();
    });
  });

  it('muestra título "Gestión de Exámenes" y botón de crear si es admin', async () => {
    useAuth.mockReturnValue({ role: "admin" });
    api.get.mockResolvedValue({ data: [] });
    render(
      <MemoryRouter>
        <ExamenesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Gestión de Exámenes Médicos"),
      ).toBeInTheDocument();
      expect(screen.getByText("Nuevo Examen")).toBeInTheDocument();
    });
  });

  it("NO muestra botón de crear si es paciente", async () => {
    useAuth.mockReturnValue({ role: "paciente" });
    api.get.mockResolvedValue({ data: [] });
    render(
      <MemoryRouter>
        <ExamenesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Nuevo Examen")).not.toBeInTheDocument();
    });
  });

  it("carga los exámenes y los pasa a la tabla", async () => {
    useAuth.mockReturnValue({ role: "medico" });
    api.get.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });
    render(
      <MemoryRouter>
        <ExamenesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("tabla-examenes")).toHaveTextContent(
        "Tabla con 2 exámenes",
      );
    });
  });

  it('abre el formulario de edición si hay un "edit" en la URL', async () => {
    useAuth.mockReturnValue({ role: "admin" });
    api.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter initialEntries={["/examenes?edit=5"]}>
        <ExamenesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("form-examen")).toHaveTextContent("ID: 5");
    });
  });
});
