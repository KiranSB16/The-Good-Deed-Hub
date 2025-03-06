/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#edf2f7",
        ring: "#3182ce",
        background: "#f7fafc",
        foreground: "#2d3748",
        primary: {
          DEFAULT: "#3182ce",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#2d3748",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#e53e3e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#a0aec0",
          foreground: "#1a202c",
        },
        accent: {
          DEFAULT: "#38b2ac",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#2d3748",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#2d3748",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}
