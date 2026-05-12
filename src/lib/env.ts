function required(name: string, value: string | undefined): string {
  if (!value && typeof window === "undefined") {
    console.warn(`[env] Missing ${name}; set it in .env for production.`);
  }
  return value ?? "";
}

export const API_URL = required(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
);

export const FRONTEND_URL = required(
  "NEXT_PUBLIC_FRONTEND_URL",
  process.env.NEXT_PUBLIC_FRONTEND_URL,
);

export const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io";

export const ADMIN_API_PREFIX =
  process.env.NEXT_PUBLIC_ADMIN_API_PREFIX ?? "/api/v1/admin";

export function apiV1Url(path: string): string {
  const base = API_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api/v1${p}`;
}

export function adminApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, "");
  const prefix = ADMIN_API_PREFIX.startsWith("/") ? ADMIN_API_PREFIX : `/${ADMIN_API_PREFIX}`;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${p}`;
}
