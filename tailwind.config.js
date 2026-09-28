/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Stitch Design System Color Palette
        "on-secondary-fixed-variant": "#344088",
        "surface-container-low": "#1c1b1c",
        "surface-variant": "#353436",
        "primary": "#bbc3ff",
        "outline": "#8e8fa2",
        "outline-variant": "#444656",
        "primary-fixed": "#dee0ff",
        "on-secondary": "#1c2971",
        "primary-container": "#3d5afe",
        "surface-tint": "#bbc3ff",
        "inverse-primary": "#2848ee",
        "inverse-surface": "#e5e2e3",
        "on-tertiary-fixed": "#002108",
        "on-primary-container": "#f1f0ff",
        "on-secondary-container": "#a9b4ff",
        "tertiary-fixed": "#69ff87",
        "on-surface-variant": "#c5c5d9",
        "surface-bright": "#39393a",
        "surface-dim": "#131314",
        "surface-container": "#201f20",
        "error": "#ffb4ab",
        "on-primary-fixed": "#000f5d",
        "surface-container-lowest": "#0e0e0f",
        "on-tertiary-container": "#c7ffc7",
        "on-primary-fixed-variant": "#002ccd",
        "on-primary": "#001d93",
        "on-secondary-fixed": "#010f5c",
        "tertiary": "#3ce36a",
        "secondary": "#bbc3ff",
        "on-tertiary-fixed-variant": "#00531e",
        "on-background": "#e5e2e3",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "inverse-on-surface": "#313031",
        "surface-container-high": "#2a2a2b",
        "on-surface": "#e5e2e3",
        "tertiary-fixed-dim": "#3ce36a",
        "surface-container-highest": "#353436",
        "surface": "#131314",
        "primary-fixed-dim": "#bbc3ff",
        "on-tertiary": "#003912",
        "on-error": "#690005",
        "tertiary-container": "#007f32",
        "secondary-container": "#37438b",
        "secondary-fixed": "#dee0ff",
        "background": "#131314",
        "secondary-fixed-dim": "#bbc3ff"
      },
      borderRadius: {
        DEFAULT: "0.5rem", // 8px (ROUND_EIGHT)
        sm: "0.25rem", // 4px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.25rem", // 20px
        full: "9999px"
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
        sans: ["Manrope", "sans-serif"]
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px"
      }
    },
  },
  plugins: [],
}