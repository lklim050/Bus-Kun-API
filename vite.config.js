import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      // Catch anything starting with /ltaodataservice
      "/ltaodataservice": {
        target: "https://datamall2.mytransport.sg",
        changeOrigin: true,
        secure: false,
      },
      "/map": {
        target: "https://www.lta.gov.sg",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
