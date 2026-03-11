import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 5173,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      // Fallback so the app works without the env var in dev
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL ?? ''),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
