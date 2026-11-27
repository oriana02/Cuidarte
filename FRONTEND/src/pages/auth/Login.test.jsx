import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import Login from "./Login";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../../hooks/useAuth", () => ({ useAuth: vi.fn() }));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<div>Pantalla Home</div>} />
        <Route path="/registro" element={<div>Pantalla Registro</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("Login", () => {
  let login;

  beforeEach(() => {
    vi.clearAllMocks();
    login = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ login, loading: false });
  });

  it("muestra los campos y el botón de entrar", () => {
    renderLogin();
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByTestId("button-login")).toHaveTextContent("Entrar");
  });

  it("no envía el formulario si está vacío", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(login).not.toHaveBeenCalled();
    });
  });

  it("inicia sesión y redirige a /home con credenciales válidas", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByTestId("input-nombre-usuario"), "medico");
    await user.type(screen.getByTestId("input-password"), "Clave123!");
    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        nombre_usuario: "medico",
        password: "Clave123!",
      });
    });
    expect(toast.success).toHaveBeenCalledWith("Sesión iniciada");
    expect(await screen.findByText("Pantalla Home")).toBeInTheDocument();
  });

  it("muestra un error si las credenciales son inválidas", async () => {
    login.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByTestId("input-nombre-usuario"), "medico");
    await user.type(screen.getByTestId("input-password"), "Incorrecta1!");
    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Credenciales inválidas");
    });
    expect(screen.queryByText("Pantalla Home")).not.toBeInTheDocument();
  });

  it("deshabilita el botón mientras carga", () => {
    useAuth.mockReturnValue({ login, loading: true });
    renderLogin();

    const boton = screen.getByTestId("button-login");
    expect(boton).toBeDisabled();
    expect(boton).toHaveTextContent("Ingresando...");
  });

  it("enlaza a la pantalla de registro", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByTestId("link-registro"));
    expect(await screen.findByText("Pantalla Registro")).toBeInTheDocument();
  });

  it("abre y cierra la guía inicial", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: /guía inicial/i }));
    expect(
      await screen.findByText("Usuarios predeterminados"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cerrar/i }));
    await waitFor(() => {
      expect(
        screen.queryByText("Usuarios predeterminados"),
      ).not.toBeInTheDocument();
    });
  });
});
