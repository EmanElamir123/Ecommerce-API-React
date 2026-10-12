import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// إعدادات Vite الأساسية لمشروع الفرونت
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
