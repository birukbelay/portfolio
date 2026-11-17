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
        "word-rise": {
          from: { opacity: "0", transform: "translateY(0.45em) rotate(2deg)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "none", filter: "blur(0)" },
        },
        type: {
          from: { clipPath: "inset(0 100% 0 0)" },
          to: { clipPath: "inset(0 0 0 0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "trail-draw": { from: { strokeDashoffset: "200" }, to: { strokeDashoffset: "0" } },
        "trail-fade": { "0%, 55%": { opacity: "1" }, "100%": { opacity: "0" } },
        "land-pulse": {
          "0%": { opacity: "0", scale: ".5" },
          "15%": { opacity: ".9" },
          "100%": { opacity: "0", scale: "1.9" },
        },
        "piece-out": {
          "0%": { transform: "scale(1) rotate(0)", opacity: "1" },
          "100%": { transform: "scale(.2) rotate(200deg) translateY(-12px)", opacity: "0" },
        },
        promote: {
          "0%": { transform: "scale(0) rotate(-200deg)", filter: "brightness(2)" },
          "70%": { transform: "scale(1.3) rotate(10deg)" },
          "100%": { transform: "scale(1) rotate(0)", filter: "none" },
        },
        "deal-in": {
          "0%": { opacity: "0", transform: "translateX(60px) rotate(12deg)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "chip-drop": {
          "0%": { opacity: "0", transform: "translateY(-60px) rotate(-200deg)" },
          "60%": { opacity: "1", transform: "translateY(4px) rotate(10deg)" },
          "80%": { transform: "translateY(-3px) rotate(-4deg)" },
          "100%": { transform: "none" },
        },
        "coin-flip": {
          "0%": { transform: "rotateY(0) translateY(0)" },
          "40%": { transform: "rotateY(900deg) translateY(-18px)" },
          "100%": { transform: "rotateY(1440deg) translateY(0)" },
        },
        sparkle: {
          "0%": { boxShadow: "0 0 0 0 rgb(255 215 106 / .9)", opacity: "1" },
          "100%": { boxShadow: "0 0 0 16px rgb(255 215 106 / 0)", opacity: "0" },
        },
        bulb: { "0%, 100%": { opacity: "1" }, "50%": { opacity: ".25" } },
        burst: {
          "0%": { opacity: "1", transform: "translate(-50%,-50%) scale(.3) rotate(0)" },
          "70%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 26px)) scale(1) rotate(var(--rot))" },
        },
        "coin-fall": {
          "0%": { opacity: "0", transform: "translateY(-6px) rotateY(0)" },
          "15%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(110px) rotateY(900deg)" },
        },
        "chip-spin": {
          "0%": { transform: "translateY(0) rotate(0)" },
          "35%": { transform: "translateY(-10px) rotate(420deg)" },
          "70%": { transform: "translateY(0) rotate(700deg)" },
          "85%": { transform: "translateY(-2px) rotate(726deg)" },
          "100%": { transform: "translateY(0) rotate(720deg)" },
        },
        "chip-roll": {
          "0%": { opacity: "0", transform: "translateX(220px) rotate(720deg)" },
          "20%": { opacity: "1" },
          "75%": { transform: "translateX(-6px) rotate(-12deg)" },
          "88%": { transform: "translateX(3px) rotate(6deg)" },
          "100%": { transform: "none" },
        },
        "card-turn": { "0%": { transform: "rotateY(180deg)" }, "100%": { transform: "rotateY(0)" } },
        "draw-down": { "0%": { transform: "scaleY(0)" }, "100%": { transform: "scaleY(1)" } },
        "cap-toss": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "40%": { transform: "translateY(-14px) rotate(-200deg)" },
          "70%": { transform: "translateY(-4px) rotate(-340deg)" },
        },
        "slide-out": { "0%": { opacity: "0", transform: "translateX(-18px)" }, "100%": { opacity: "1", transform: "none" } },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-30px, 20px) scale(1.06)" },
          "66%": { transform: "translate(20px, -15px) scale(.96)" },
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
        "word-rise": "word-rise .8s cubic-bezier(.2,.7,.2,1) both",
        type: "type .5s steps(28, end) both",
        marquee: "marquee 40s linear infinite",
        float: "float 18s ease-in-out infinite",
        "deal-in": "deal-in .6s cubic-bezier(.2,.8,.25,1.05) both",
        "chip-drop": "chip-drop .8s cubic-bezier(.3,.7,.3,1) both",
        "coin-flip": "coin-flip 1.4s cubic-bezier(.3,.6,.3,1) both",
        sparkle: "sparkle .8s ease-out both",
        bulb: "bulb .5s ease-in-out infinite",
        burst: "burst 1.1s cubic-bezier(.2,.7,.3,1) both",
        "coin-fall": "coin-fall 1.2s cubic-bezier(.4,0,.8,.6) both",
        "chip-spin": "chip-spin 1s cubic-bezier(.3,.6,.3,1) both",
        "chip-roll": "chip-roll 1s cubic-bezier(.25,.7,.3,1) both",
        "card-turn": "card-turn .6s cubic-bezier(.3,.7,.3,1) both",
        "draw-down": "draw-down 1s ease-out both",
        "cap-toss": "cap-toss 1s ease-in-out both",
        "slide-out": "slide-out .5s ease-out both",
        "trail-draw": "trail-draw .6s ease-out both",
        "trail-fade": "trail-fade 1.1s ease-out both",
        "land-pulse": "land-pulse .6s ease-out both",
        promote: "promote .7s cubic-bezier(.2,.8,.3,1.2) both",
        "piece-out": "piece-out .45s ease-in both",
      },
    },
  },
  plugins: [],
};
