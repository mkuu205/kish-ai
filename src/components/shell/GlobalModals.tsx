"use client";

import { AuthModal } from "@/components/auth/AuthModal";
import { OtpModal } from "@/components/auth/OtpModal";
import { PaymentModal } from "@/components/payment/PaymentModal";

export function GlobalModals() {
  return (
    <>
      <AuthModal />
      <OtpModal />
      <PaymentModal />
    </>
  );
}
