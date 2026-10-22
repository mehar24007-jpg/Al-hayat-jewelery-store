/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15110f",
        panel: "#1e1916",
        panel2: "#272019",
        line: "#3a3027",
        cream: "#f1e8d8",
        muted: "#a99c88",
        gold: "#c9a45c",
        "gold-soft": "#e3c98f",
        "on-gold": "#1a1308",
        warn: "#e0836b",
        ok: "#8fbf9a",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
