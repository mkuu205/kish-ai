export type UserPlan = "free" | "pro";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  role?: UserRole;
  verified?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
  pendingVerification?: boolean;
  email?: string;
}

export interface RegisterResponse {
  email?: string;
  message?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}
