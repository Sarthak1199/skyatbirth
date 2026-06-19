import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0b1024",
        "void-2": "#10162f",
        parchment: "#efe6d2",
        brass: "#ad8a4d",
        "brass-dark": "#8a6a34",
        oxblood: "#7a2e2e",
        ink: "#2b2418",
        starlight: "#f4efe3",
      },
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        garamond: ["EB Garamond", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
