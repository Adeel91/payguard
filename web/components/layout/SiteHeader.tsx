import Link from "next/link";
import { Logo } from "./Logo";

const CROO_AGENT_URL =
  "https://agent.croo.network/agents/47460383-b9cc-486c-a349-68ac98098f4b";

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
          <a
            href={CROO_AGENT_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            CROO Agent
          </a>
        </nav>
      )}

      <div className="flex items-center gap-3">
        <a
          href={CROO_AGENT_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full border border-blue/20 bg-blue-soft px-5 py-3 text-sm font-black text-blue transition hover:scale-[1.02] sm:inline-flex"
        >
          Hire on CROO
        </a>

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
      </div>
    </header>
  );
}
