import axios from "axios";

/*
 * Smoke test script for the Gabarita.AI API. This script can be run
 * with Node.js to verify that each endpoint returns the expected
 * contract shape (success/data or error). Adjust the base URL by
 * setting the NEXT_PUBLIC_API_URL environment variable.
 */

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "https://SEU-BACKEND"}/api`;

const out = [];

async function check(name, fn) {
  try {
    const t0 = Date.now();
    const res = await fn();
    const ms = Date.now() - t0;
    const ok = res?.data?.success === true || res?.status < 400;
    out.push({ name, ms, ok, sample: res?.data });
  } catch (e) {
    out.push({ name, ok: false, error: e?.response?.data || String(e) });
  }
}

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

await check("health", () => api.get("/health"));
await check("opcoes/cargos-blocos", () => api.get("/opcoes/cargos-blocos"));
await check("opcoes/diagnostico", () => api.get("/opcoes/diagnostico"));
await check("opcoes/blocos-cargos", () => api.get("/opcoes/blocos-cargos"));
await check("opcoes/cargos/6", () => api.get("/opcoes/cargos/6"));
await check("opcoes/blocos/Enfermeiro", () => api.get("/opcoes/blocos/Enfermeiro"));
await check("questoes/gerar", () => api.post("/questoes/gerar", { usuario_id: "u1", cargo: "Enfermeiro", bloco: "6" }));
await check("questoes/responder", () => api.post("/questoes/responder", { questao_id: "q1", resposta: "C" }));
await check("payments/process", () => api.post("/payments/process", { plano_id: "premium", user_id: "u1" }));
await check("payments/status/:id", () => api.get("/payments/status/123456"));
await check("user/u1 (alias)", () => api.get("/user/u1").catch(() => api.get("/usuarios/u1")));

console.log(JSON.stringify(out, null, 2));