import Image from "next/image";
import Link from "next/link";

export function Logo({ subtitle = "payment permission agent" }: { subtitle?: string }) {
  return (
    <Link
      href="/"
      className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left"
    >
      <Image
        src="/logo.png"
        alt="PayGuard"
        width={44}
        height={44}
        priority
        className="h-11 w-11 rounded-2xl object-contain"
      />

      <div>
        <p className="text-lg font-black leading-none tracking-[-0.03em]">PayGuard</p>
        <p className="mt-1 text-xs font-bold text-muted">{subtitle}</p>
      </div>
    </Link>
  );
}
