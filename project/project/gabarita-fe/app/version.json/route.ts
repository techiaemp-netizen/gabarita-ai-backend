import { NextResponse } from "next/server";

/**
 * Route to expose version and build metadata for the frontend. This can
 * assist with debugging and ensuring the correct build is deployed.
 */
export async function GET() {
  return NextResponse.json({
    app: "frontend",
    apiBase: process.env.NEXT_PUBLIC_API_URL,
    builtAt: new Date().toISOString(),
  });
}