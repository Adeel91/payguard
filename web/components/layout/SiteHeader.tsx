import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader({
  subtitle,
  nav = true,
}: {
  subtitle?: string;
  nav?: boolean;
}) {
  return (
    <header className="flex items-center justify-between rounded-[2rem] border border-line bg-paper px-5 py-4 brand-shadow">
      <Logo subtitle={subtitle} />

      {nav && (
        <nav className="hidden items-center gap-6 text-sm font-bold text-muted md:flex">
          <a href="#review" className="hover:text-ink">
            Review
          </a>
          <a href="#flow" className="hover:text-ink">
            Flow
          </a>
          <a href="#croo" className="hover:text-ink">
            CROO
          </a>
        </nav>
      )}

      <Link
        href={nav ? "/scan" : "/"}
        className={
          nav
            ? "rounded-full bg-ink px-5 py-3 text-sm font-black text-paper transition hover:scale-[1.02]"
            : "rounded-full border border-line bg-canvas px-5 py-3 text-sm font-black text-ink transition hover:bg-paper-soft"
        }
      >
        {nav ? "Open scanner" : "Home"}
      </Link>
    </header>
  );
}
