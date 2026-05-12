"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-slate-100">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <div className="font-mono text-xs text-cyan-300">ERROR</div>
        <h1 className="mt-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-400">{error.message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
