"use client";

/**
 * A simple card container with rounded corners and a subtle shadow.
 *
 * Wrap your content in this component to present it in a raised
 * container consistent with the rest of the application.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
