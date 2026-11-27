import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { describe, it, expect } from "vitest";
import AuthProvider from "./context/AuthContext";
import theme from "./theme";
import App from "./App";

describe("App", () => {
  it("renderiza sin romperse", () => {
    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter initialEntries={["/"]}>
            <App />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>,
    );
    expect(document.body).toBeInTheDocument();
  });
});
