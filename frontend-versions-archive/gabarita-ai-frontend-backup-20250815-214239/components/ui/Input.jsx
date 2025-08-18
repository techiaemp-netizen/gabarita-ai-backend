"use client";

/**
 * A basic input field with default styling.
 */
export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary ${className}`}
      {...props}
    />
  );
}
