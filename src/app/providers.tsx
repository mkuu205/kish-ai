"use client";

import { type ReactNode, Suspense } from "react";

import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { ThemeHydration } from "@/components/theme/ThemeHydration";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { GlobalModals } from "@/components/shell/GlobalModals";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeHydration />
      <SocketProvider>
        <Suspense fallback={null}>{children}</Suspense>
        <GlobalModals />
        <ToastViewport />
      </SocketProvider>
    </AuthProvider>
  );
}
