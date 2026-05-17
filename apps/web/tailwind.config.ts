import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // fast-glob misinterprets () in route group dir names; use character classes
    "./app/*.{js,ts,jsx,tsx,mdx}",
    "./app/[a-z]*/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/[(]admin[)]/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
