import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c2430",
        paper: "#f8f7f3",
        line: "#d8ddd6",
        accent: "#2b7a78",
        coral: "#d66a50"
      }
    }
  },
  plugins: []
};

export default config;
