"use client";

import Link from 'next/link';

/**
 * NewsItem component
 *
 * Displays a compact news card showing a title, its source and a
 * link. The card is styled minimally to fit within a grid layout.
 */
export default function NewsItem({ title, source, url }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between">
      <div>
        <h4 className="font-medium mb-1 text-sm md:text-base">{title}</h4>
        <span className="text-xs text-gray-500">{source}</span>
      </div>
      <Link href={url} className="text-primary text-sm mt-2 hover:underline">
        Ler mais
      </Link>
    </div>
  );
}
