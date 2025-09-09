"use client";
import { useState } from "react";
import { postPaymentsProcess, getPaymentStatus } from "@/sdk";

/**
 * Page to demonstrate the payments endpoints. Allows creating a payment
 * preference and querying its status. Results are displayed to verify
 * contract and integration.
 */
export default function PaymentsPage() {
  const [processRes, setProcessRes] = useState<any>({});
  const [statusRes, setStatusRes] = useState<any>({});
  const [err, setErr] = useState<string | undefined>();

  const criar = async () => {
    setErr(undefined);
    try {
      const data = await postPaymentsProcess({ plano_id: "premium", user_id: "u1" });
      setProcessRes(data);
    } catch (e: any) {
      setProcessRes({ error: String(e) });
    }
  };

  const status = async () => {
    const id = prompt("Payment ID para consultar status:", "123456") || "123456";
    setErr(undefined);
    try {
      const data = await getPaymentStatus(id);
      setStatusRes(data);
    } catch (e: any) {
      setStatusRes({ error: String(e) });
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="flex gap-3">
        <button
          onClick={criar}
          className="px-4 py-2 rounded bg-black text-white"
        >
          /payments/process
        </button>
        <button
          onClick={status}
          className="px-4 py-2 rounded bg-neutral-700 text-white"
        >
          /payments/status/:id
        </button>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      <section>
        <h2 className="font-semibold">Process</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(processRes, null, 2)}
        </pre>
      </section>
      <section>
        <h2 className="font-semibold">Status</h2>
        <pre className="bg-neutral-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(statusRes, null, 2)}
        </pre>
      </section>
    </main>
  );
}