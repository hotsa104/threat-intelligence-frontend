import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./ThemeContext";
import { LightDashboard } from "./components/LightDashboard";
import "./styles/globals.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LightDashboard />
    </ThemeProvider>
  </React.StrictMode>
);
