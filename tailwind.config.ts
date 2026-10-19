import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecfff",
          400: "#59b4ff",
          500: "#2f8cff",
          600: "#1769f2",
          700: "#1554de",
          800: "#1845b4",
          900: "#193e8e"
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 10px 30px rgba(28,42,67,.06)",
        float: "0 18px 50px rgba(15,23,42,.14)",
      },
      animation: {
        "fade-up": "fadeUp .45s ease-out both",
        "soft-pulse": "softPulse 2.6s ease-in-out infinite",
        "fade-in": "fadeIn .3s ease-out",
        "screen-in": "screenIn .34s cubic-bezier(.32,.72,0,1) both",
        "screen-out": "screenOut .26s cubic-bezier(.4,0,1,1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        screenIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        screenOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        softPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(47,140,255,.15)" },
          "50%": { boxShadow: "0 0 0 8px rgba(47,140,255,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
