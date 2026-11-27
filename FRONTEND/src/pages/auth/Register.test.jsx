import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";
import { api } from "../../lib/api.jsx";
import Register from "./Register";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../../lib/api.jsx", () => ({ api: { post: vi.fn() } }));

const renderRegister = () =>
  render(
    <MemoryRouter initialEntries={["/registro"]}>
      <Routes>
        <Route path="/registro" element={<Register />} />
        <Route path="/login" element={<div>Pantalla Login</div>} />
      </Routes>
    </MemoryRouter>,
  );

const completar = async (user, { usuario, correo, password }) => {
  await user.type(screen.getByTestId("input-registro-nombre-usuario"), usuario);
  await user.type(screen.getByTestId("input-registro-correo"), correo);
  await user.type(screen.getByTestId("input-registro-password"), password);
};

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockResolvedValue({ data: {} });
  });

  it("muestra los campos del formulario", () => {
    renderRegister();
    expect(screen.getByLabelText(/nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("valida los campos obligatorios", async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByTestId("button-registro-crear-cuenta"));

    expect(
      await screen.findByText("El nombre de usuario es requerido"),
    ).toBeInTheDocument();
    expect(screen.getByText("El correo es requerido")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es requerida")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("valida el formato del correo y el largo de la contraseña", async () => {
    const user = userEvent.setup();
    renderRegister();

    await completar(user, {
      usuario: "ori",
      correo: "no-es-correo",
      password: "123",
    });
    await user.click(screen.getByTestId("button-registro-crear-cuenta"));

    expect(
      await screen.findByText("El correo debe tener un formato válido"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La contraseña debe tener al menos 6 caracteres"),
    ).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("rechaza un RUT con formato inválido", async () => {
    const user = userEvent.setup();
    renderRegister();

    await completar(user, {
      usuario: "oriana",
      correo: "ori@test.cl",
      password: "Clave123!",
    });
    await user.type(screen.getByTestId("input-registro-rut"), "abc");
    await user.click(screen.getByTestId("button-registro-crear-cuenta"));

    expect(
      await screen.findByText(/El RUT debe tener formato válido/i),
    ).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("registra al usuario y redirige a /login", async () => {
    const user = userEvent.setup();
    renderRegister();

    await completar(user, {
      usuario: "oriana",
      correo: "ori@test.cl",
      password: "Clave123!",
    });
    await user.click(screen.getByTestId("button-registro-crear-cuenta"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/autenticacion/registro", {
        nombre_usuario: "oriana",
        password: "Clave123!",
        correo: "ori@test.cl",
        rut: undefined,
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Cuenta creada exitosamente, ahora inicia sesión",
    );
    expect(await screen.findByText("Pantalla Login")).toBeInTheDocument();
  });

  it("no redirige si el registro falla", async () => {
    api.post.mockRejectedValue(new Error("500"));
    const user = userEvent.setup();
    renderRegister();

    await completar(user, {
      usuario: "oriana",
      correo: "ori@test.cl",
      password: "Clave123!",
    });
    await user.click(screen.getByTestId("button-registro-crear-cuenta"));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(screen.queryByText("Pantalla Login")).not.toBeInTheDocument();
  });
});
