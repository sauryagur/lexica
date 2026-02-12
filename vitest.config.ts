import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}", "__tests__/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "__tests__/",
        "*.config.*",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
      ],
    },
  },
  resolve: {
    alias: {
      "@/app": resolve(__dirname, "./app"),
      "@": resolve(__dirname, "."),
    },
  },
});
