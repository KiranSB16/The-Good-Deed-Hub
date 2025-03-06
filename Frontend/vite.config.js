import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-separator",
      "lucide-react"
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3800',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
