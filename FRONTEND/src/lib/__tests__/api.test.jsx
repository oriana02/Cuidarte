import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, setAuthToken } from "../api";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("api.jsx", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Limpiamos el header de axios
    delete api.defaults.headers.common.Authorization;
  });

  describe("setAuthToken", () => {
    it("agrega el token a los headers por defecto", () => {
      setAuthToken("mi-token-123");
      expect(api.defaults.headers.common.Authorization).toBe(
        "Bearer mi-token-123",
      );
    });

    it("elimina el token si se pasa null", () => {
      setAuthToken("mi-token-123");
      setAuthToken(null);
      expect(api.defaults.headers.common.Authorization).toBeUndefined();
    });
  });

  describe("Interceptor de Peticiones", () => {
    // Función helper para obtener el interceptor
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;

    it("agrega el token al header si existe en localStorage", () => {
      localStorage.setItem("token", "token-local");
      const config = { url: "/pacientes", method: "get", headers: {} };
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBe("Bearer token-local");
    });

    it("NO agrega el token si la URL es de login", () => {
      localStorage.setItem("token", "token-local");
      const config = {
        url: "/autenticacion/login",
        method: "post",
        headers: {},
      };
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it("NO agrega el token si es un registro de empresa sin token", () => {
      const config = { url: "/empresas", method: "POST", headers: {} };
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it("NO agrega el token en rutas públicas", () => {
      localStorage.setItem("token", "token-local");
      const config = { url: "/public/contratos", method: "get", headers: {} };
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Interceptor de Respuestas (Manejo de Errores)", () => {
    const responseErrorInterceptor =
      api.interceptors.response.handlers[0].rejected;

    it("muestra toast con error y glosa si el backend responde así", async () => {
      const error = {
        response: {
          data: { error: "Fallo", glosa: "Detalle del fallo" },
        },
      };

      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith("Fallo", {
        description: "Detalle del fallo",
        duration: 5000,
      });
    });

    it("muestra toast si solo hay error sin glosa", async () => {
      const error = { response: { data: { error: "Fallo" } } };
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith("Fallo");
    });

    it("muestra toast si hay un mensaje genérico", async () => {
      const error = { response: { data: { message: "Mensaje" } } };
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith("Mensaje");
    });

    it("muestra toast genérico con status HTTP si no hay data", async () => {
      const error = {
        response: { status: 500, statusText: "Server Error", data: {} },
      };
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith("Error: 500 - Server Error");
    });

    it("muestra toast de error de conexión si no hay response", async () => {
      const error = { request: {} };
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith(
        "Error de conexión. Verifica tu conexión a internet.",
      );
    });

    it("muestra toast genérico para otros errores", async () => {
      const error = { message: "Error inesperado" };
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
      expect(toast.error).toHaveBeenCalledWith("Error inesperado");
    });
  });
});
