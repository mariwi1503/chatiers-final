import clsx from "clsx";

type AvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  ring?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function Avatar({ src, alt, size = "md", online, ring, className }: AvatarProps) {
  return (
    <span className={clsx("relative inline-flex shrink-0", className)}>
      <img
        src={src}
        alt={alt}
        className={clsx(
          sizes[size],
          "rounded-full bg-slate-100 object-cover",
          ring && "ring-2 ring-brand-500 ring-offset-2"
        )}
      />
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
}
