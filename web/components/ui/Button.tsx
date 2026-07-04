import Link from "next/link";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "bg-ink text-paper hover:scale-[1.02]"
      : "border border-line bg-canvas text-ink hover:bg-paper-soft";

  return (
    <Link
      href={href}
      className={`rounded-full px-7 py-4 text-center font-black transition ${className}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className="rounded-full bg-ink px-7 py-4 font-black text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
