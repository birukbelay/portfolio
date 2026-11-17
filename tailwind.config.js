/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Public-site tokens (see styles/globals.css); they switch with the OS theme.
        paper: token("paper"),
        surface: token("surface"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        accent: token("accent"),
        "accent-ink": token("accent-ink"),
        deep: token("deep"), // always-dark panels (code card, contact block)
        // Fixed brand color for the admin panel (light only)
        brand: {
          50: "#fff4ee",
          100: "#ffe5d6",
          500: "#f05a28",
          600: "#d94a1a",
          700: "#b43c14",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulse_dot: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(34 197 94 / .55)" },
          "50%": { boxShadow: "0 0 0 6px rgb(34 197 94 / 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in .2s ease-out both",
        "slide-in-right": "slide-in-right .28s cubic-bezier(.2,.7,.2,1) both",
        "scale-in": "scale-in .18s ease-out both",
        "pulse-dot": "pulse_dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
