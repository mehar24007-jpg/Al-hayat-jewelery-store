/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: c("ink"),
        panel: c("panel"),
        panel2: c("panel2"),
        line: c("line"),
        cream: c("cream"),
        muted: c("muted"),
        gold: c("gold"),
        "gold-soft": c("gold-soft"),
        "on-gold": c("on-gold"),
        warn: c("warn"),
        ok: c("ok"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
