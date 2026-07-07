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
    <header className="mt-3 flex flex-col gap-4 rounded-[2rem] border border-line bg-paper px-5 py-4 brand-shadow sm:flex-row sm:items-center sm:justify-between">
      <Logo subtitle={subtitle} />

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Link
          href={CROO_AGENT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex justify-center rounded-full border border-blue/20 bg-blue-soft px-5 py-3 text-sm font-black text-blue transition hover:scale-[1.02]"
        >
          Hire on CROO
        </Link>

        <Link
          href={nav ? "/scan" : "/"}
          className={
            nav
              ? "inline-flex justify-center rounded-full bg-ink px-5 py-3 text-sm font-black text-paper transition hover:scale-[1.02]"
              : "inline-flex justify-center rounded-full border border-line bg-canvas px-5 py-3 text-sm font-black text-ink transition hover:bg-paper-soft"
          }
        >
          {nav ? "Open scanner" : "Home"}
        </Link>
      </div>
    </header>
  );
}
