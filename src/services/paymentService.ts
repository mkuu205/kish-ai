import { apiPost, authHeaders } from "@/lib/api/client";
import { API_V1_PREFIX } from "@/constants/routes";
import type { PaymentAction } from "@/types/payment";
import type { MpesaInitiateResponse, MpesaStatusResponse, StripeCheckoutResponse } from "@/types/payment";

const base = API_V1_PREFIX;

export async function paymentRequest<T>(
  token: string,
  body: PaymentAction,
): Promise<T> {
  return apiPost<T>(`${base}/payment`, body, authHeaders(token));
}

export async function stripeCheckout(token: string): Promise<StripeCheckoutResponse> {
  return paymentRequest<StripeCheckoutResponse>(token, { action: "stripe_checkout" });
}

export async function mpesaInitiate(token: string, phone: string): Promise<MpesaInitiateResponse> {
  return paymentRequest<MpesaInitiateResponse>(token, {
    action: "mpesa_initiate",
    phone,
  });
}

export async function mpesaStatus(
  token: string,
  reference: string,
): Promise<MpesaStatusResponse> {
  return paymentRequest<MpesaStatusResponse>(token, {
    action: "mpesa_status",
    reference,
  });
}
