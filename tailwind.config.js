// tailwind.config.js
/** @type {import('tailwindcss').Config} */

const color = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: color("canvas"),
        surface: color("surface"),
        elevated: color("elevated"),
        border: color("border"),
        "primary-text": color("primary-text"),
        "muted-text": color("muted-text"),
        lime: {
          DEFAULT: color("lime"),
          foreground: color("lime-foreground"),
        },
        success: color("success"),
        warning: color("warning"),
        destructive: {
          DEFAULT: color("destructive"),
          foreground: color("destructive-foreground"),
        },
        card: color("card"),
        input: color("input"),
        "input-border": color("input-border"),
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};