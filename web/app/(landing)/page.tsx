import Link from "next/link";

const checks = [
  "Recipient",
  "Approval",
  "Contract",
  "Wallet impact",
  "Agent payment",
  "Final decision",
];

const steps = [
  {
    number: "1",
    title: "Payment is prepared",
    text: "A wallet, app, or CROO agent creates a transfer, approval, contract call, or seller payment.",
  },
  {
    number: "2",
    title: "PayGuard reviews it",
    text: "The action is decoded and checked for suspicious recipients, risky permissions, contract issues, and possible wallet impact.",
  },
  {
    number: "3",
    title: "The caller gets a decision",
    text: "PayGuard returns Allow, Warn, or Block before the signature or payment continues.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <header className="animate-fade-up flex items-center justify-between rounded-[2rem] border border-line bg-paper px-5 py-4 brand-shadow">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-sm font-black text-paper">
              PG
            </div>

            <div>
              <p className="text-lg font-black leading-none tracking-[-0.03em]">
                PayGuard
              </p>
              <p className="mt-1 text-xs font-bold text-muted">
                payment permission agent
              </p>
            </div>
          </Link>

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

          <Link
            href="/scan"
            className="rounded-full bg-ink px-5 py-3 text-sm font-black text-paper transition hover:scale-[1.02]"
          >
            Open scanner
          </Link>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch lg:py-16">
          <div className="animate-fade-up-slow rounded-[3rem] border border-line bg-paper p-8 brand-shadow sm:p-10 lg:p-12">
            <div className="inline-flex animate-glow-ring items-center gap-3 rounded-full bg-green-soft px-4 py-2 text-sm font-black text-green">
              <span className="h-2.5 w-2.5 rounded-full bg-green" />
              checks before funds move
            </div>

            <h1 className="mt-10 max-w-3xl text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
              Your wallet should ask first.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
              PayGuard sits before a Web3 payment, token approval, contract call, or CROO
              agent payment. It explains what is about to happen and returns a clear
              Allow, Warn, or Block decision.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/scan"
                className="rounded-full bg-ink px-7 py-4 text-center font-black text-paper transition hover:scale-[1.02]"
              >
                Scan a payment
              </Link>

              <a
                href="#flow"
                className="rounded-full border border-line bg-canvas px-7 py-4 text-center font-black text-ink transition hover:bg-paper-soft"
              >
                See how it works
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {checks.map((check) => (
                <div
                  key={check}
                  className="rounded-3xl border border-line bg-canvas px-4 py-4 text-sm font-black text-muted"
                >
                  {check}
                </div>
              ))}
            </div>
          </div>

          <div
            id="review"
            className="animate-float-soft grid gap-5 rounded-[3rem] border border-line bg-paper-soft p-5 brand-shadow"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-paper p-6">
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 animate-scan-line bg-gradient-to-b from-blue-soft/0 via-blue-soft to-blue-soft/0 opacity-60" />

              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    payment review
                  </p>
                  <h2 className="mt-5 text-5xl font-black tracking-[-0.06em] text-red">
                    Block
                  </h2>
                </div>

                <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-red-soft text-center">
                  <div>
                    <p className="text-xs font-black uppercase text-red">risk</p>
                    <p className="text-3xl font-black text-red">91</p>
                  </div>
                </div>
              </div>

              <div className="relative mt-7 rounded-[2rem] bg-red-soft p-5">
                <p className="text-lg font-black text-red">
                  Unknown spender wants token permission
                </p>
                <p className="mt-3 leading-7 text-muted">
                  This action may allow another contract to move assets from the wallet
                  later. PayGuard recommends stopping until the spender is verified.
                </p>
              </div>

              <div className="relative mt-5 grid gap-3">
                <ReviewRow label="Action" value="Token approval" />
                <ReviewRow label="Recipient" value="Unknown contract" />
                <ReviewRow label="Impact" value="Assets may move later" />
                <ReviewRow label="Next" value="Do not sign" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniCard
                title="Allow"
                text="Continue safely"
                tone="green"
                className="animate-fade-up delay-100"
              />
              <MiniCard
                title="Warn"
                text="Review first"
                tone="orange"
                className="animate-fade-up delay-200"
              />
              <MiniCard
                title="Block"
                text="Stop action"
                tone="red"
                className="animate-fade-up delay-300"
              />
            </div>
          </div>
        </section>

        <section id="flow" className="grid gap-5 py-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="animate-fade-up rounded-[3rem] bg-ink p-8 text-paper sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-paper/45">
              the product
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              A permission layer before payment.
            </h2>
            <p className="mt-6 text-lg leading-8 text-paper/65">
              PayGuard does not recover funds after a mistake. It reduces the chance of
              the mistake by checking before the signature happens.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`animate-fade-up grid gap-5 rounded-[2.5rem] border border-line bg-paper p-6 sm:grid-cols-[4rem_1fr] ${
                  index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300"
                }`}
              >
                <div className="grid h-16 w-16 place-items-center rounded-[1.5rem] bg-blue-soft text-2xl font-black text-blue">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="croo" className="grid gap-5 py-10 lg:grid-cols-3">
          <InfoCard
            title="For users"
            text="Paste a transaction or approval and get a plain language safety decision before signing."
          />
          <InfoCard
            title="For agents"
            text="A CROO buyer agent hires PayGuard before sending USDC or executing an on chain action."
          />
          <InfoCard
            title="For CROO"
            text="PayGuard becomes a paid safety dependency for agent commerce, wallets, DeFi agents, and marketplace flows."
          />
        </section>
      </div>
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-canvas px-5 py-4">
      <span className="text-sm font-black text-muted">{label}</span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}

function MiniCard({
  title,
  text,
  tone,
  className = "",
}: {
  title: string;
  text: string;
  tone: "green" | "orange" | "red";
  className?: string;
}) {
  const toneClass =
    tone === "green"
      ? "bg-green-soft text-green"
      : tone === "orange"
        ? "bg-orange-soft text-orange"
        : "bg-red-soft text-red";

  return (
    <div className={`rounded-[2rem] p-5 ${toneClass} ${className}`}>
      <p className="text-xl font-black">{title}</p>
      <p className="mt-2 text-sm font-bold opacity-70">{text}</p>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="animate-fade-up rounded-[3rem] border border-line bg-paper p-8">
      <h3 className="text-3xl font-black tracking-[-0.05em]">{title}</h3>
      <p className="mt-4 leading-7 text-muted">{text}</p>
    </div>
  );
}
