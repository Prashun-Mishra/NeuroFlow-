/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#080b12",
        surface: "#101623",
        "surface-muted": "#1a2235",
        primary: "#6366f1", // indigo-500
        "primary-hover": "#818cf8", // indigo-400
        danger: "#fb7185", // rose-400
        text: "#f8fafc", // slate-50
        "text-muted": "#94a3b8", // slate-400
        border: "#1e293b", // slate-800
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
      }
    },
  },
  plugins: [],
};
