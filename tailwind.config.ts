import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#09111f",
        mist: "#eef4f1",
        tide: "#0f766e",
        coral: "#d97706",
        rose: "#9f1239",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(9, 17, 31, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
