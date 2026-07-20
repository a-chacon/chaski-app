/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");
const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
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
    heroui({
      themes: {

        "blue-light": {
          "extend": "light",
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#e4f3ff",
              "100": "#c0d8f3",
              "200": "#9abee5",
              "300": "#72a4d9",
              "400": "#4c8acd",
              "500": "#3371b4",
              "600": "#26588d",
              "700": "#193f65",
              "800": "#0a263f",
              "900": "#000e1b",
              "DEFAULT": "#3371b4",
              "foreground": "#000000"
            },
            "focus": "#4c8acd"
          }
        },

        "yellow-light": {
          "extend": "light",
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#fff8df",
              "100": "#ffe9b3",
              "200": "#feda83",
              "300": "#fecb52",
              "400": "#febc26",
              "500": "#e5a314",
              "600": "#b27f0c",
              "700": "#7f5a05",
              "800": "#4d3600",
              "900": "#1c1200",
              "DEFAULT": "#e5a314",
              "foreground": "#000000"
            },
            "focus": "#febc26"
          }
        },

        "red-light": {
          "extend": "light",
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#ffe8e8",
              "100": "#f0c5c5",
              "200": "#dfa0a0",
              "300": "#d17b7c",
              "400": "#c35656",
              "500": "#a93c3c",
              "600": "#842e2f",
              "700": "#602121",
              "800": "#3b1212",
              "900": "#1c0303",
              "DEFAULT": "#a93c3c",
              "foreground": "#000000"
            },
            "focus": "#c35656"
          }
        },

        "orange-light": {
          "extend": "light", // Inherit default values from light theme
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#fff0de",
              "100": "#fdd3b4",
              "200": "#f7b787",
              "300": "#f29a59",
              "400": "#ee7d2b",
              "500": "#d46312",
              "600": "#a64d0d",
              "700": "#783708",
              "800": "#492001",
              "900": "#1e0800",
              "DEFAULT": "#d46312",
              "foreground": "#000000"
            },
            "focus": "#ee7d2b"
          }
        },

        "purple-light": {
          "extend": "light",
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#f5ecff",
              "100": "#d8cbe9",
              "200": "#beaad6",
              "300": "#a388c4",
              "400": "#8866b3",
              "500": "#6f4d99",
              "600": "#563c78",
              "700": "#3e2a57",
              "800": "#261936",
              "900": "#0e0718",
              "DEFAULT": "#6f4d99",
              "foreground": "#000000"
            },
            "focus": "#8866b3"
          }
        },

        "green-light": {
          "extend": "light",
          "colors": {
            "background": "#ffffff",
            "foreground": "#000000",
            "primary": {
              "50": "#eef8e8",
              "100": "#d8e5cb",
              "200": "#c0d2ac",
              "300": "#a7c08c",
              "400": "#8eae6c",
              "500": "#759452",
              "600": "#5a733f",
              "700": "#40522c",
              "800": "#263118",
              "900": "#0a1100",
              "DEFAULT": "#759452",
              "foreground": "#000000"
            },
            "focus": "#8eae6c"
          }
        },

        "blue-dark": {
          "extend": "dark",
          "colors": {
            "background": "#000e1b",
            "foreground": "#ffffff",
            "primary": {
              "50": "#000e1b",
              "100": "#0a263f",
              "200": "#193f65",
              "300": "#26588d",
              "400": "#3371b4",
              "500": "#4c8acd",
              "600": "#72a4d9",
              "700": "#9abee5",
              "800": "#c0d8f3",
              "900": "#e4f3ff",
              "DEFAULT": "#4c8acd",
              "foreground": "#ffffff"
            },
            "focus": "#72a4d9"
          }
        },

        "yellow-dark": {
          "extend": "dark",
          "colors": {
            "background": "#1c1200",
            "foreground": "#ffffff",
            "primary": {
              "50": "#1c1200",
              "100": "#4d3600",
              "200": "#7f5a05",
              "300": "#b27f0c",
              "400": "#e5a314",
              "500": "#febc26",
              "600": "#fecb52",
              "700": "#feda83",
              "800": "#ffe9b3",
              "900": "#fff8df",
              "DEFAULT": "#febc26",
              "foreground": "#ffffff"
            },
            "focus": "#fecb52"
          }
        },

        "yellow-dark": {
          extend: "dark",
          colors: {
            primary: {
              50: "#9f7a00",
              100: "#b98c00",
              200: "#d29f00",
              300: "#e6b700",
              400: "#f7c800",
              500: "#f9d128",
              600: "#fbd95b",
              700: "#fddf8e",
              800: "#fef0c1",
              900: "#fff8e3",
              DEFAULT: "#f7c800",
              foreground: "#ffffff",
            },
            focus: "#e6b700",
          },
        },
        "red-dark": {
          "extend": "dark",
          "colors": {
            "background": "#1c0303",
            "foreground": "#ffffff",
            "primary": {
              "50": "#1c0303",
              "100": "#3b1212",
              "200": "#602121",
              "300": "#842e2f",
              "400": "#a93c3c",
              "500": "#c35656",
              "600": "#d17b7c",
              "700": "#dfa0a0",
              "800": "#f0c5c5",
              "900": "#ffe8e8",
              "DEFAULT": "#c35656",
              "foreground": "#ffffff"
            },
            "focus": "#d17b7c"
          }
        },

        "orange-dark": {
          "extend": "dark", // Inherit default values from dark theme
          "colors": {
            "background": "#0E0000",  // Inverted background
            "foreground": "#ffffff",  // Inverted foreground
            "primary": {
              "50": "#1e0800",  // Inverted colors
              "100": "#492001",
              "200": "#783708",
              "300": "#a64d0d",
              "400": "#d46312",
              "500": "#ee7d2b",
              "600": "#f29a59",
              "700": "#f7b787",
              "800": "#fdd3b4",
              "900": "#fff0de",
              "DEFAULT": "#ee7d2b",
              "foreground": "#ffffff"
            },
            "focus": "#f29a59"
          }
        },

        "purple-dark": {
          "extend": "dark",
          "colors": {
            "background": "#0e0718",
            "foreground": "#ffffff",
            "primary": {
              "50": "#0e0718",
              "100": "#261936",
              "200": "#3e2a57",
              "300": "#563c78",
              "400": "#6f4d99",
              "500": "#8866b3",
              "600": "#a388c4",
              "700": "#beaad6",
              "800": "#d8cbe9",
              "900": "#f5ecff",
              "DEFAULT": "#8866b3",
              "foreground": "#ffffff"
            },
            "focus": "#a388c4"
          }
        },

        "green-dark": {
          "extend": "dark",
          "colors": {
            "background": "#0a1100",
            "foreground": "#ffffff",
            "primary": {
              "50": "#0a1100",
              "100": "#263118",
              "200": "#40522c",
              "300": "#5a733f",
              "400": "#759452",
              "500": "#8eae6c",
              "600": "#a7c08c",
              "700": "#c0d2ac",
              "800": "#d8e5cb",
              "900": "#eef8e8",
              "DEFAULT": "#8eae6c",
              "foreground": "#ffffff"
            },
            "focus": "#a7c08c"
          }
        },
      },
    }),
  ],
};
