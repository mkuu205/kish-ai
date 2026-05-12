export interface ApiErrorPayload {
  error?: string;
  message?: string;
  upgrade?: boolean;
  pendingVerification?: boolean;
  email?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload;

  constructor(message: string, status: number, payload: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
