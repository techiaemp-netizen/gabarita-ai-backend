"use client";
import { useState } from "react";
import { postGerarQuestao, postResponderQuestao } from "@/sdk";

/**
 * Page to demonstrate the question endpoints. Allows generating a new
 * question and submitting an answer. Responses are displayed for
 * verification. Errors are handled gracefully.
 */
export default function QuestoesPage() {
  const [generated, setGenerated] = useState<any>({});
  const [answered, setAnswered] = useState<any>({});
  const [msg, setMsg] = useState<string | undefined>();

  const gerarQuestao = async () => {
    setMsg("Gerando...");
    try {
      const data = await postGerarQuestao({
        usuario_id: "u1",
        cargo: "Enfermeiro",
        bloco: "6",
      });
      setGenerated(data);
    } catch (e: any) {
      setGenerated({ error: String(e) });
    }
    setMsg(undefined);
  };

  const responderQuestao = async () => {
    const qid = generated?.data?.questao?.id ?? "q1";
    setMsg(`Respondendo ${qid}...`);
    try {
      const data = await postResponderQuestao({
        questao_id: qid,
        resposta: "C",
      });
      setAnswered(data);
    } catch (e: any) {
      setAnswered({ error: String(e) });
    }
    setMsg(undefined);
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Questões</h1>
      <div className="flex gap-3">
        <button
          onClick={gerarQuestao}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Gerar questão
        </button>
        <button
          onClick={responderQuestao}
          className="px-4 py-2 rounded bg-neutral-700 text-white"
        >
          Responder questão
        </button>
      </div>
      {msg && <p className="text-sm opacity-70">{msg}</p>}
      <section>
        <h2 className="font-semibold">Resposta /questoes/gerar</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(generated, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-semibold">Resposta /questoes/responder</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(answered, null, 2)}
        </pre>
      </section>
    </main>
  );
}