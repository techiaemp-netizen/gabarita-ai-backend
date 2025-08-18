"use client";

/**
 * Horizontal progress bar
 *
 * Accepts a value between 0 and 100 representing the percentage of
 * progress completed. The bar fills proportionally and uses the
 * primary colour defined in the Tailwind configuration.
 */
export default function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
