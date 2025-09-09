"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUsuarioById } from "@/sdk";

/**
 * Profile page to fetch and display user information by id. The alias
 * `/user/:id` or `/usuarios/:id` is resolved in the SDK. The response
 * is shown for contract verification and debugging.
 */
export default function PerfilPage() {
  const { id } = useParams<{ id: string }>();
  const [resp, setResp] = useState<any>({});
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    if (id) {
      getUsuarioById(String(id))
        .then(setResp)
        .catch((e) => setErr(String(e)));
    }
  }, [id]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Perfil {String(id ?? "")}</h1>
      {err && <pre className="text-red-600">{err}</pre>}
      <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(resp, null, 2)}
      </pre>
    </main>
  );
}