import clsx from "clsx";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={clsx("flex items-center overflow-hidden", className)} aria-label="Chatiers">
      <img
        src="/logo.png"
        alt="Chatiers"
        className={clsx("object-contain mix-blend-multiply", compact ? "h-auto w-full" : "h-16 w-36")}
      />
    </div>
  );
}
