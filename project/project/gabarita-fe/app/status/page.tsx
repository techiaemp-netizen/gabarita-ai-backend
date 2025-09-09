"use client";
import { useEffect, useState } from "react";
import { getHealth } from "@/sdk";

/**
 * Displays the backend health information. This page fetches
 * metadata such as status, branch, commit, and build date via
 * `/api/health` and displays the raw JSON for inspection.
 */
export default function StatusPage() {
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    getHealth().then(setResp).catch((e) => setErr(String(e)));
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Status do Backend</h1>
      <p className="text-sm opacity-70 mb-4">
        API: {process.env.NEXT_PUBLIC_API_URL}/api
      </p>
      {err && <pre className="text-red-600">{err}</pre>}
      <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(resp ?? {}, null, 2)}
      </pre>
    </main>
  );
}
