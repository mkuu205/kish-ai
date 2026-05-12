import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { API_URL } from "@/lib/env";
import { ApiError, type ApiErrorPayload } from "@/types/api";

export const TOKEN_STORAGE_KEY = "kish_token";
export const REFRESH_TOKEN_STORAGE_KEY = "kish_refresh_token";

export const apiClient = axios.create({
  baseURL: API_URL.replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

function parsePayload(data: unknown): ApiErrorPayload {
  if (data && typeof data === "object") return data as ApiErrorPayload;
  return {};
}

function toApiError(err: AxiosError<ApiErrorPayload>): ApiError {
  const payload = err.response?.data ? parsePayload(err.response.data) : {};
  const msg =
    payload.error ||
    payload.message ||
    err.message ||
    "Request failed";
  return new ApiError(msg, err.response?.status ?? 0, { ...payload, ...err.response?.data });
}

apiClient.interceptors.response.use(
  (res) => {
    // Unwrap the backend envelope { success, message, data } → return data directly
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      res.data = (res.data as { data: unknown }).data;
    }
    return res;
  },
  (err: AxiosError<ApiErrorPayload>) => Promise.reject(toApiError(err)),
);

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.patch<T>(url, body, config);
  return res.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
}

export function authHeaders(token: string | null): AxiosRequestConfig {
  if (!token) return {};
  return { headers: { Authorization: `Bearer ${token}` } };
}
