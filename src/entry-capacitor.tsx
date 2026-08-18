import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

// Direct CSS import so Vite injects it into the SPA build.
// In the normal TanStack Start build, CSS is loaded via head() + HeadContent/shellComponent.
import "./styles.css";

const router = getRouter();

const el = document.getElementById("app");
if (!el) throw new Error("Root element #app not found");

createRoot(el).render(<RouterProvider router={router} />);
