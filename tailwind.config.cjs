/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        opensans: ['"OpenSans"', ...defaultTheme.fontFamily.sans],
        arial: ['"Arial"', ...defaultTheme.fontFamily.sans],
        roboto: ['"Roboto"', ...defaultTheme.fontFamily.sans],
        tisa: ['"Tisa"', ...defaultTheme.fontFamily.sans],
        garamond: ['"Garamond"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("@tailwindcss/typography"),
    nextui({
      themes: {
        dark: {
          colors: {
            default: {
              50: "#f6f6f9",
              100: "#ebebf3",
              200: "#d3d4e4",
              300: "#acaecd",
              400: "#7f84b1",
              500: "#5f6498",
              600: "#4b4e7e",
              700: "#3e4066",
              800: "#363856",
              900: "#30304a",
              950: "#10101A",
            },
            primary: {
              50: "#331d00", // 900
              100: "#663a00",
              200: "#995800",
              300: "#cc7500",
              400: "#ff9200",
              500: "#ffa833",
              600: "#ffbe66",
              700: "#ffd399",
              800: "#ffe9cc",
              900: "#fff4e6", // 50
              foreground: "#fff4e6",
              DEFAULT: "#ff9200",
            },
            background: "#0B0C15",
            foreground: "#F4F4F4",
          },
        },
        light: {
          colors: {
            default: {
              50: "#10101A",
              100: "#30304a",
              200: "#363856",
              300: "#3e4066",
              400: "#4b4e7e",
              500: "#5f6498",
              600: "#7f84b1",
              700: "#acaecd",
              800: "#d3d4e4",
              900: "#ebebf3",
              950: "#f6f6f9",
            },
            primary: {
              50: "#fff4e6",
              100: "#ffe9cc",
              200: "#ffd399",
              300: "#ffbe66",
              400: "#ffa833",
              500: "#ff9200",
              600: "#cc7500",
              700: "#995800",
              800: "#663a00",
              900: "#331d00",
              foreground: "#10101A",
              DEFAULT: "#ff9200",
            },
            background: "#F4F4F4",
            foreground: "#0B0C15",
          },
        },
      },
    }),
  ],
};
