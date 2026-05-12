export type PaymentProvider = "stripe" | "mpesa";

export type PaymentAction =
  | { action: "stripe_checkout" }
  | { action: "mpesa_initiate"; phone: string }
  | { action: "mpesa_status"; reference: string };

export interface StripeCheckoutResponse {
  url: string;
}

export interface MpesaInitiateResponse {
  reference: string;
}

export type MpesaPaymentStatus = "completed" | "failed" | "pending" | string;

export interface MpesaStatusResponse {
  status: MpesaPaymentStatus;
  amount?: number;
}
