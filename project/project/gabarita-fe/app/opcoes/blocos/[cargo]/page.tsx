"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getBlocosPorCargo } from "@/sdk";

/**
 * Dynamic page to display blocks available for a specific cargo (position).
 * The `cargo` parameter comes from the URL path. The component calls the
 * corresponding SDK function to fetch data from the backend and renders
 * the JSON response for verification. Errors are shown in red.
 */
export default function BlocosPorCargoPage() {
  const { cargo } = useParams<{ cargo: string }>();
  const [resp, setResp] = useState<any>({});
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    if (cargo) {
      getBlocosPorCargo(String(cargo))
        .then(setResp)
        .catch((e) => setErr(String(e)));
    }
  }, [cargo]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold">
        /opcoes/blocos/{String(cargo ?? "")}
      </h1>
      {err && <pre className="text-red-600">{err}</pre>}
      <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(resp, null, 2)}
      </pre>
    </main>
  );
}