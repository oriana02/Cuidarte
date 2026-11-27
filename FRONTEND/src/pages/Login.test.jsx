import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";

describe("Login", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "abc123" }),
    });
  });

  it("muestra los campos de correo y contraseña", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/correo|email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña|password/i)).toBeInTheDocument();
  });

  it("permite escribir y enviar el formulario", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/correo|email/i), "medico@test.cl");
    await user.type(screen.getByLabelText(/contraseña|password/i), "Clave123!");
    await user.click(screen.getByRole("button", { name: /ingresar|iniciar/i }));

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
