import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { ADMIN_API_PREFIX } from "@/lib/env";

function adminPath(path: string): string {
  const prefix = ADMIN_API_PREFIX.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${prefix}${suffix}`;
}

function adminHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export interface AdminStats {
  totalUsers: number;
  newThisWeek: number;
  proUsers: number;
  freeUsers: number;
  mrr: number;
  totalRevKES: number;
  totalMessages: number;
  verifiedUsers: number;
  unverified: number;
  payments: {
    completed: number;
    pending: number;
    failed: number;
    stripe: number;
    mpesa: number;
    total: number;
  };
}

export async function adminLogin(email: string, password: string): Promise<{ token: string }> {
  return apiPost<{ token: string }>(adminPath("/login"), { email, password });
}

export async function adminStats(token: string): Promise<AdminStats> {
  return apiGet<AdminStats>(adminPath("/stats"), adminHeaders(token));
}

export async function adminActivity(
  token: string,
  limit = 100,
): Promise<{ activity: AdminActivityItem[] }> {
  return apiGet<{ activity: AdminActivityItem[] }>(
    `${adminPath("/activity")}?limit=${limit}`,
    adminHeaders(token),
  );
}

export interface AdminActivityItem {
  type: string;
  email?: string;
  ts: string;
  method?: string;
  amount?: string;
  reason?: string;
  by?: string;
  recipients?: string;
  subject?: string;
}

export interface AdminUserRow {
  email: string;
  name: string;
  plan: string;
  verified: boolean;
  totalMessages?: number;
  createdAt: string;
  stripeSubscriptionId?: string | null;
  mpesaPhone?: string | null;
  mpesaExpiry?: string | null;
  role?: string;
}

export async function adminUsers(
  token: string,
  params: { search: string; plan: string; page: number; limit: number },
): Promise<{ users: AdminUserRow[]; total: number; pages: number }> {
  const q = new URLSearchParams({
    search: params.search,
    plan: params.plan,
    page: String(params.page),
    limit: String(params.limit),
  });
  return apiGet<{ users: AdminUserRow[]; total: number; pages: number }>(
    `${adminPath("/users")}?${q.toString()}`,
    adminHeaders(token),
  );
}

export async function adminPayments(
  token: string,
  params: { method: string; status: string; page: number; limit: number },
): Promise<{
  payments: Array<{
    reference: string;
    email: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }>;
  total: number;
  pages: number;
}> {
  const q = new URLSearchParams({
    method: params.method,
    status: params.status,
    page: String(params.page),
    limit: String(params.limit),
  });
  return apiGet(`${adminPath("/payments")}?${q.toString()}`, adminHeaders(token));
}

export async function adminSystem(token: string): Promise<AdminSystemPayload> {
  return apiGet<AdminSystemPayload>(adminPath("/system"), adminHeaders(token));
}

export interface AdminSystemPayload {
  nodeVersion: string;
  uptime: number;
  env: string;
  memory: { heapUsed: number; heapTotal: number; rss: number };
  checks: Record<string, string>;
  dbSize: { users: number; payments: number; activity: number };
}

export async function adminSetPlan(token: string, email: string, plan: string): Promise<void> {
  await apiPatch(adminPath(`/users/${encodeURIComponent(email)}/plan`), { plan }, adminHeaders(token));
}

export async function adminVerifyUser(token: string, email: string): Promise<void> {
  await apiPatch(
    adminPath(`/users/${encodeURIComponent(email)}/verify`),
    {},
    adminHeaders(token),
  );
}

export async function adminDeleteUser(token: string, email: string): Promise<void> {
  await apiDelete(adminPath(`/users/${encodeURIComponent(email)}`), adminHeaders(token));
}

export async function adminUserDetail(token: string, email: string): Promise<AdminUserDetail> {
  return apiGet<AdminUserDetail>(
    adminPath(`/users/${encodeURIComponent(email)}`),
    adminHeaders(token),
  );
}

export interface AdminUserDetail extends AdminUserRow {
  id: string;
  upgradedAt?: string | null;
  payments?: Array<{
    reference: string;
    createdAt: string;
    method: string;
    amount: number;
    status: string;
  }>;
}

export async function adminBroadcast(
  token: string,
  body: { subject: string; message: string; planFilter: string },
): Promise<{ sent: number }> {
  return apiPost<{ sent: number }>(adminPath("/broadcast"), body, adminHeaders(token));
}

export function adminExportUsersUrl(): string {
  const prefix = ADMIN_API_PREFIX.replace(/\/$/, "");
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  return `${base}${prefix}/export/users`;
}
