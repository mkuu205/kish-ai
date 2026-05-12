import { ApiError } from "@/types/api";

export function isAuthUpgradeError(err: unknown): err is ApiError {
  return err instanceof ApiError && Boolean(err.payload.upgrade);
}

export function isPendingVerification(err: unknown): err is ApiError {
  return err instanceof ApiError && Boolean(err.payload.pendingVerification);
}
