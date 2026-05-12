import { apiPost, apiGet, authHeaders } from "@/lib/api/client";
import { API_V1_PREFIX } from "@/constants/routes";
import type { AuthUser, LoginResponse, RegisterResponse, VerifyOtpResponse } from "@/types/auth";

const base = API_V1_PREFIX;

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>(`${base}/auth/login`, { email, password });
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>(`${base}/auth/register`, { name, email, password });
}

export async function verifyOtpRequest(
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  return apiPost<VerifyOtpResponse>(`${base}/auth/verify-otp`, { email, otp });
}

export async function resendOtpRequest(email: string): Promise<{ message?: string }> {
  return apiPost(`${base}/auth/resend-otp`, { email });
}

export async function meRequest(token: string): Promise<AuthUser> {
  return apiGet<AuthUser>(`${base}/auth/me`, authHeaders(token));
}
