import { cn } from "@/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black",
        className,
      )}
    />
  );
}
