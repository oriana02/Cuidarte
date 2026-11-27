import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  RequireAuth,
  RequireAdmin,
  RequireMedico,
  RequireAdminOrOwnUser,
} from "../RoleGuard";
import { useAuth } from "../../hooks/useAuth";

// Mockeamos el hook de autenticación
vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("RoleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RequireAuth", () => {
    it("redirige a /login si no hay token", () => {
      useAuth.mockReturnValue({ token: null });
      render(
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <div>Admin</div>
                </RequireAuth>
              }
            />
            <Route path="/login" element={<div>Página Login</div>} />
          </Routes>
        </MemoryRouter>,
      );
      expect(screen.getByText("Página Login")).toBeInTheDocument();
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });

    it("renderiza el hijo si hay token", () => {
      useAuth.mockReturnValue({ token: "token-valido" });
      render(
        <MemoryRouter>
          <RequireAuth>
            <div>Contenido Protegido</div>
          </RequireAuth>
        </MemoryRouter>,
      );
      expect(screen.getByText("Contenido Protegido")).toBeInTheDocument();
    });
  });

  describe("RequireAdmin", () => {
    it("deniega acceso si el rol no es admin", () => {
      useAuth.mockReturnValue({ role: "paciente" });
      render(
        <RequireAdmin>
          <div>Panel Admin</div>
        </RequireAdmin>,
      );
      expect(screen.getByText(/No autorizado/i)).toBeInTheDocument();
    });

    it("permite acceso si el rol es admin", () => {
      useAuth.mockReturnValue({ role: "admin" });
      render(
        <RequireAdmin>
          <div>Panel Admin</div>
        </RequireAdmin>,
      );
      expect(screen.getByText("Panel Admin")).toBeInTheDocument();
    });
  });

  describe("RequireMedico", () => {
    it("deniega acceso si el rol es paciente", () => {
      useAuth.mockReturnValue({ role: "paciente" });
      render(
        <RequireMedico>
          <div>Panel Médico</div>
        </RequireMedico>,
      );
      expect(screen.getByText(/No autorizado/i)).toBeInTheDocument();
    });

    it("permite acceso si el rol es medico", () => {
      useAuth.mockReturnValue({ role: "medico" });
      render(
        <RequireMedico>
          <div>Panel Médico</div>
        </RequireMedico>,
      );
      expect(screen.getByText("Panel Médico")).toBeInTheDocument();
    });

    it("permite acceso si el rol es admin", () => {
      useAuth.mockReturnValue({ role: "admin" });
      render(
        <RequireMedico>
          <div>Panel Médico</div>
        </RequireMedico>,
      );
      expect(screen.getByText("Panel Médico")).toBeInTheDocument();
    });
  });

  describe("RequireAdminOrOwnUser", () => {
    it("permite acceso a un admin", () => {
      useAuth.mockReturnValue({ role: "admin", user: {} });
      render(
        <MemoryRouter initialEntries={["/usuarios/5"]}>
          <Routes>
            <Route
              path="/usuarios/:id"
              element={
                <RequireAdminOrOwnUser>
                  <div>Formulario</div>
                </RequireAdminOrOwnUser>
              }
            />
          </Routes>
        </MemoryRouter>,
      );
      expect(screen.getByText("Formulario")).toBeInTheDocument();
    });

    it("permite acceso si es el propio usuario", () => {
      useAuth.mockReturnValue({ role: "paciente", user: { usuarioId: 5 } });
      render(
        <MemoryRouter initialEntries={["/usuarios/5"]}>
          <Routes>
            <Route
              path="/usuarios/:id"
              element={
                <RequireAdminOrOwnUser>
                  <div>Formulario</div>
                </RequireAdminOrOwnUser>
              }
            />
          </Routes>
        </MemoryRouter>,
      );
      expect(screen.getByText("Formulario")).toBeInTheDocument();
    });

    it("deniega acceso si es paciente y quiere editar a otro", () => {
      useAuth.mockReturnValue({ role: "paciente", user: { usuarioId: 5 } });
      render(
        <MemoryRouter initialEntries={["/usuarios/99"]}>
          <Routes>
            <Route
              path="/usuarios/:id"
              element={
                <RequireAdminOrOwnUser>
                  <div>Formulario</div>
                </RequireAdminOrOwnUser>
              }
            />
          </Routes>
        </MemoryRouter>,
      );
      expect(screen.getByText(/No autorizado/i)).toBeInTheDocument();
    });
  });
});
