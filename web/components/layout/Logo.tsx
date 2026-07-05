import Image from "next/image";
import Link from "next/link";

export function Logo({ subtitle = "payment permission agent" }: { subtitle?: string }) {
  return (
    <Link href="/" className="flex items-center gap-3">
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
