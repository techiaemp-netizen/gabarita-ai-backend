/**
 * Tailwind CSS configuration
 *
 * The content array defines which files Tailwind should scan for class
 * names. Colours and fonts are extended to match the light pastel
 * palette described in the design specification. Feel free to adjust
 * these values to better suit your branding.
 */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3E8EFF",
        background: "#F5F5F5",
        beige: "#F7F3E9",
        accent: "#D6E5FA",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
