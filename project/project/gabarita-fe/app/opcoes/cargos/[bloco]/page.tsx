"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCargosPorBloco } from "@/sdk";

/**
 * Dynamic page to display cargos (positions) available for a specific block.
 * The `bloco` parameter comes from the URL path. The component calls the
 * corresponding SDK function to fetch data from the backend and renders
 * the JSON response for debugging or contract verification purposes. Any
 * errors are displayed in red text.
 */
export default function CargosPorBlocoPage() {
  const { bloco } = useParams<{ bloco: string }>();
  const [resp, setResp] = useState<any>({});
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    if (bloco) {
      getCargosPorBloco(String(bloco))
        .then(setResp)
        .catch((e) => setErr(String(e)));
    }
  }, [bloco]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold">
        /opcoes/cargos/{String(bloco ?? "")}
      </h1>
      {err && <pre className="text-red-600">{err}</pre>}
      <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(resp, null, 2)}
      </pre>
    </main>
  );
}