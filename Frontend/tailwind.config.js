import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stonewash: "#003329",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        talentflow: {
          primary: "#003329",
          secondary: "#DEBF6C",
          accent: "#6AE8D3",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
        },
      },
    ],
  },
};
