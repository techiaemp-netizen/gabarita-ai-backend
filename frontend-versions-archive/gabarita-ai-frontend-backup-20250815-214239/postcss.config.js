/**
 * PostCSS configuration
 *
 * This file wires Tailwind CSS and Autoprefixer into the build
 * pipeline. When running `npm run dev` or `npm run build` the
 * configuration below ensures that Tailwind’s utility classes are
 * available and vendor prefixes are applied automatically.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
