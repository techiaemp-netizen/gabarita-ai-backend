"use client";
import { useEffect, useState } from "react";
import { getCargosBlocos, getDiagnostico, getBlocosCargos } from "@/sdk";

/**
 * Displays the main options page. Fetches and renders the
 * responses from several endpoints: cargos-blocos, diagnostico,
 * and blocos-cargos. Each section shows the raw JSON response
 * from the backend, allowing developers to verify the API
 * contract in real time.
 */
export default function OpcoesPage() {
  const [a, setA] = useState<any>({});
  const [b, setB] = useState<any>({});
  const [c, setC] = useState<any>({});
  const [err, setErr] = useState<any>(null);

  useEffect(() => {
    Promise.all([getCargosBlocos(), getDiagnostico(), getBlocosCargos()])
      .then(([ra, rb, rc]) => {
        setA(ra);
        setB(rb);
        setC(rc);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Opções (prova viva)</h1>
      {err && <pre className="text-red-600">{err}</pre>}
      <section>
        <h2 className="font-semibold">/opcoes/cargos-blocos</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(a, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-semibold">/opcoes/diagnostico</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(b, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-semibold">/opcoes/blocos-cargos</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(c, null, 2)}
        </pre>
      </section>
    </main>
  );
}
