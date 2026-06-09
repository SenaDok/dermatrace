
// All API calls to the DermTrace backend
// Base URL points to local Docker container by default

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

let token: string | null = null;
export const setToken = (t: string | null) => { token = t; };

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  register: (email: string, password: string) =>
    req<any>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email: string, password: string) =>
    req<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // ── Procedures ─────────────────────────────────────────────────────────────
  createProcedure: (type: string, date: string, clinic_name?: string) =>
    req<any>('/procedures', { method: 'POST', body: JSON.stringify({ type, date, clinic_name }) }),

  getActiveProcedure: () =>
    req<any>('/procedures/active'),

  // ── Checkins ───────────────────────────────────────────────────────────────
  submitCheckin: (data: {
    procedure_id: string; redness: number; swelling: number;
    flaking: number; discomfort: number; notes?: string;
  }) => req<any>('/checkins', { method: 'POST', body: JSON.stringify(data) }),

  listCheckins: (procedureId: string) =>
    req<any[]>(`/checkins?procedure_id=${procedureId}`),

  // ── Timeline ───────────────────────────────────────────────────────────────
  getTimeline: (procedureId: string) =>
    req<any>(`/timeline/${procedureId}`),

  // ── Risk ───────────────────────────────────────────────────────────────────
  getRisk: (procedureId: string) =>
    req<any>(`/risk/${procedureId}`),

  // ── Scanner ────────────────────────────────────────────────────────────────
  scan: (procedureId: string, barcode?: string, productName?: string) =>
    req<any>('/scan', {
      method: 'POST',
      body: JSON.stringify({ procedure_id: procedureId, barcode, product_name: productName }),
    }),
};
