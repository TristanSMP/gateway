/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  darkMode: "class",
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        tsmp: {
          primary: "#E935C1",
          secondary: "#7775D6",
          accent: "#7775D6",
          neutral: "#18111c",
          "base-100": "#18111c",
          info: "#7775D6",
          success: "#20DF69",
          warning: "#F9CB15",
          error: "#F94871",
        },
      },
    ],
  },
};
