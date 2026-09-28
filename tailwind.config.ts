import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#172B4D",
          primary: "#172B4D",
          deep: "#0B1628",
          mid: "#29466F",
          inreview: "#315B91",
        },
        sand: {
          DEFAULT: "#D7C3A5",
          warm: "#D7C3A5",
          pale: "#F0E7D8",
          border: "#DDD8CF",
        },
        ivory: {
          DEFAULT: "#F8F6F1",
          surface: "#F5F3EE",
        },
        graphite: {
          DEFAULT: "#171A1F",
          dark: "#171A1F",
        },
        slate: {
          muted: "#667085",
          archived: "#98A2B3",
        },
        status: {
          approved: "#2F6B4F",
          warning: "#B7791F",
          error: "#B54747",
          inreview: "#315B91",
        },
      },
    },
  },
  plugins: [],
};
export default config;
