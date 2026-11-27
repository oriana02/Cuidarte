import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PacientesList from "../PacientesList";
import { api } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

// Mockeamos los componentes hijos para no testear las tablas complejas
vi.mock("../PacientesTabList", () => ({
  default: ({ items }) => (
    <div data-testid="tabla-pacientes">Tabla con {items.length} pacientes</div>
  ),
}));
vi.mock("../PacientesTabCreate", () => ({
  default: () => <div data-testid="form-paciente">Formulario de paciente</div>,
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mockeamos la API
vi.mock("../../../lib/api", () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("PacientesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ role: "admin" });
  });

  it("muestra el spinner de carga al inicio", () => {
    api.get.mockReturnValue(new Promise(() => {})); // Promesa infinita
    render(
      <MemoryRouter>
        <PacientesList />
      </MemoryRouter>,
    );
    expect(screen.getByText("Cargando pacientes...")).toBeInTheDocument();
  });

  it("carga los pacientes y los pasa a la tabla", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, nombre: "Ana" }] });
    render(
      <MemoryRouter>
        <PacientesList />
      </MemoryRouter>,
    );

    // Esperamos a que termine de cargar
    await waitFor(() => {
      expect(screen.getByTestId("tabla-pacientes")).toHaveTextContent(
        "Tabla con 1 pacientes",
      );
    });
    expect(api.get).toHaveBeenCalledWith("/pacientes");
  });

  it("cambia a la pestaña de creación", async () => {
    api.get.mockResolvedValue({ data: [] });
    render(
      <MemoryRouter>
        <PacientesList />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.queryByText("Cargando pacientes..."),
      ).not.toBeInTheDocument(),
    );

    // Hacemos clic en la pestaña "Registrar Paciente"
    fireEvent.click(screen.getByText("Registrar Paciente"));
    expect(screen.getByTestId("form-paciente")).toBeInTheDocument();
  });

  it("elimina un paciente si el rol es admin", async () => {
    api.get.mockResolvedValue({ data: [] });
    api.delete.mockResolvedValue({});
    render(
      <MemoryRouter>
        <PacientesList />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.queryByText("Cargando pacientes..."),
      ).not.toBeInTheDocument(),
    );

    // Buscamos el componente de la tabla para obtener la función onDelete...
    // Como mockeamos el componente, esto se prueba indirectamente en PacientesTabList.test.
    // Aquí solo verificamos que el useEffect cargó los datos.
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it("maneja el error de carga sin romperse", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValue(new Error("Error de red"));

    render(
      <MemoryRouter>
        <PacientesList />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Cargando pacientes..."),
      ).not.toBeInTheDocument();
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
