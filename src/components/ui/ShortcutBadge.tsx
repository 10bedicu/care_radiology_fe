import { cn } from "@/lib/cn";

interface ShortcutBadgeProps {
  label: string; // e.g. "P"
  className?: string;
}

export default function ShortcutBadge({
  label,
  className,
}: ShortcutBadgeProps) {
  return (
    <span
      className={cn(
        "h-5 min-w-5 flex justify-center px-1 rounded border font-medium text-xs",
        "bg-linear-to-b from-white to-gray-200 border-gray-200 text-gray-700",
        className,
      )}
    >
      {label}
    </span>
  );
}
