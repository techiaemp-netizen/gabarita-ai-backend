import { api, ApiResponse } from "@/lib/api";

// The SDK aggregates all backend API calls into a single
// module, providing strongly typed return values. Each
// function corresponds to a specific endpoint on the backend.

// Health endpoint. Returns status and optional build metadata.
export async function getHealth() {
  const { data } = await api.get<ApiResponse<{ status: string; branch?: string; commit?: string; builtAt?: string }>>(
    "/health",
  );
  return data;
}

// Opções (options) endpoints. These calls return various lists
// of available cargos/blocos combinations for the exam.
export async function getCargosBlocos() {
  const { data } = await api.get<ApiResponse>("/opcoes/cargos-blocos");
  return data;
}

export async function getDiagnostico() {
  const { data } = await api.get<ApiResponse>("/opcoes/diagnostico");
  return data;
}

export async function getBlocosCargos() {
  const { data } = await api.get<ApiResponse>("/opcoes/blocos-cargos");
  return data;
}

export async function getCargosPorBloco(bloco: string) {
  const { data } = await api.get<ApiResponse>(`/opcoes/cargos/${encodeURIComponent(bloco)}`);
  return data;
}

export async function getBlocosPorCargo(cargo: string) {
  const { data } = await api.get<ApiResponse>(`/opcoes/blocos/${encodeURIComponent(cargo)}`);
  return data;
}

// Questões (questions) endpoints. Generate a new question and submit an answer.
export async function postGerarQuestao(payload: { usuario_id?: string; cargo?: string; bloco?: string }) {
  const { data } = await api.post<ApiResponse>("/questoes/gerar", payload);
  return data;
}

export async function postResponderQuestao(payload: { questao_id: string; resposta: string; usuario_id?: string }) {
  const { data } = await api.post<ApiResponse>("/questoes/responder", payload);
  return data;
}

// Payments endpoints. Create a new payment preference and check status.
export async function postPaymentsProcess(payload: { plano_id: string; user_id: string }) {
  const { data } = await api.post<ApiResponse<{ preference_id?: string; init_point?: string; initPoint?: string }>>(
    "/payments/process",
    payload,
  );
  return data;
}

export async function getPaymentStatus(paymentId: string) {
  const { data } = await api.get<ApiResponse>(`/payments/status/${encodeURIComponent(paymentId)}`);
  return data;
}

// Usuários (users) endpoints. Try /user/{id} first, fallback to /usuarios/{id}.
export async function getUsuarioById(id: string) {
  try {
    const { data } = await api.get<ApiResponse>(`/user/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    const { data } = await api.get<ApiResponse>(`/usuarios/${encodeURIComponent(id)}`);
    return data;
  }
}
