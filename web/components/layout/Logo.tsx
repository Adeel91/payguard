import Link from "next/link";

export function Logo({ subtitle = "payment permission agent" }: { subtitle?: string }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-sm font-black text-paper">
        PG
      </div>

      <div>
        <p className="text-lg font-black leading-none tracking-[-0.03em]">PayGuard</p>
        <p className="mt-1 text-xs font-bold text-muted">{subtitle}</p>
      </div>
    </Link>
  );
}
