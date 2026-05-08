import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary-blue": "var(--color-primary-blue)",
        "deep-blue": "var(--color-deep-blue)",
        "soft-blue": "var(--color-soft-blue)",
        "ocean-green": "var(--color-ocean-green)",
        "mint-green": "var(--color-mint-green)",
        "warm-white": "var(--color-warm-white)",
        "soft-gray": "var(--color-soft-gray)",
        "dark-navy": "var(--color-dark-navy)",
        "warm-accent": "var(--color-warm-accent)",
        "ink-muted": "var(--color-ink-muted)",
        "border-soft": "var(--color-border-soft)"
      },
      boxShadow: {
        soft: "var(--shadow-soft-brand)",
        card: "var(--shadow-card-brand)"
      },
      borderRadius: {
        brand: "1.25rem"
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
