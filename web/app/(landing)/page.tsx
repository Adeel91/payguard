import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Motion } from "@/components/ui/Motion";
import { Shell } from "@/components/ui/Shell";

const heroStats = [
  ["Capability", "CAP provider"],
  ["Price", "0.05 USDC"],
  ["Decision", "ALLOW / WARN / BLOCK"],
];

const reportRows = [
  ["Chain", "Base"],
  ["Action", "ERC20 approve"],
  ["Token", "WETH"],
  ["Risk", "Unlimited approval"],
  ["Instruction", "Do not sign"],
];

const flowSteps = [
  {
    number: "01",
    title: "Buyer agent prepares an action",
    text: "A CROO buyer agent is about to approve tokens, call a contract, or pay a seller agent.",
  },
  {
    number: "02",
    title: "PayGuard checks before signing",
    text: "PayGuard decodes calldata, reads live chain evidence, checks contract verification, reputation, simulation, and policy risk.",
  },
  {
    number: "03",
    title: "Agent receives a decision",
    text: "PayGuard returns ALLOW, WARN, or BLOCK with evidence, next action, and delivery proof.",
  },
];

const engineChecks = [
  {
    title: "Calldata decoding",
    text: "Detects ERC20 approvals, transfers, transferFrom calls, NFT operator approvals, and unknown selectors.",
  },
  {
    title: "Live chain evidence",
    text: "Reads deployed code, token metadata, balances, allowance when available, and simulation result.",
  },
  {
    title: "Contract intelligence",
    text: "Checks proxy patterns, Sourcify verification, GoPlus reputation, and Blockscout metadata.",
  },
  {
    title: "Risk decision",
    text: "Turns evidence into a risk score, risk level, reasons, and a clear ALLOW, WARN, or BLOCK result.",
  },
];

const capCards = [
  {
    title: "Discoverable",
    text: "PayGuard exposes an agent manifest and CAP capability metadata so other agents can understand what it offers.",
  },
  {
    title: "Callable",
    text: "Buyer agents call authenticated endpoints before approving tokens, signing calldata, or paying another agent.",
  },
  {
    title: "Proof backed",
    text: "CAP orders return a report hash and output hash as delivery proof for the completed safety scan.",
  },
];

const endpoints = [
  ["Manifest", "GET", "/api/agent/manifest"],
  ["Capability", "GET", "/api/cap/capability"],
  ["Agent scan", "POST", "/api/agent/scan"],
  ["CAP order", "POST", "/api/cap/order"],
];

export default function Home() {
  return (
    <Shell>
      <SiteHeader />

      <section className="grid gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch lg:py-24">
        <Motion variant="slideRight">
          <Card className="relative overflow-hidden sm:p-10 lg:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-soft blur-3xl" />
            <div className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-green-soft blur-3xl" />

            <div className="relative max-w-4xl">
              <Badge tone="green">paid before signing safety agent</Badge>

              <h1 className="mt-10 text-6xl font-black leading-[0.92] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
                Agents should ask before they pay.
              </h1>

              <p className="mt-8 max-w-2xl text-xl leading-9 text-muted">
                PayGuard is a CAP provider agent that checks Web3 payments, token
                approvals, and contract calls before a buyer agent signs.
              </p>

              <p className="mt-5 max-w-2xl text-xl leading-9 text-muted">
                It gives the caller one clear execution decision.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <DecisionPill tone="green" label="ALLOW" />
                <DecisionPill tone="orange" label="WARN" />
                <DecisionPill tone="red" label="BLOCK" />
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/scan">Run live scan</ButtonLink>
                <ButtonLink href="/api/agent/manifest" variant="secondary">
                  View manifest
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Motion>

        <Motion variant="slideLeft" delay="100">
          <div className="grid h-full gap-5 rounded-[3rem] border border-line bg-paper-soft p-5 brand-shadow">
            <div className="rounded-[2.5rem] bg-paper p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                live example
              </p>

              <div className="mt-8 flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-6xl font-black tracking-[-0.07em] text-red">
                    BLOCK
                  </h2>
                  <p className="mt-4 max-w-sm text-lg font-bold leading-8 text-muted">
                    Unlimited WETH approval detected before signing.
                  </p>
                </div>

                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[2rem] bg-red-soft text-center">
                  <div>
                    <p className="text-xs font-black uppercase text-red">risk</p>
                    <p className="text-3xl font-black text-red">100</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                {reportRows.map(([label, value]) => (
                  <ResultRow key={label} label={label} value={value} />
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-ink p-6 text-paper sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-paper/45">
                buyer agent outcome
              </p>
              <p className="mt-4 text-2xl font-black leading-tight tracking-[-0.04em]">
                The agent stops before funds can move.
              </p>
            </div>
          </div>
        </Motion>
      </section>

      <section className="py-16 lg:py-20">
        <Motion variant="fadeUp">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue">
              what it is
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              A decision layer before agent execution.
            </h2>
            <p className="mt-6 text-xl leading-9 text-muted">
              PayGuard does not replace wallets, audits, or human review. It gives
              autonomous agents a fast safety decision before they approve, sign, or pay.
            </p>
          </div>
        </Motion>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {heroStats.map(([label, value]) => (
            <Motion key={label} variant="fadeUp" delay="100">
              <Card className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                  {label}
                </p>
                <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-ink">
                  {value}
                </p>
              </Card>
            </Motion>
          ))}
        </div>
      </section>

      <section id="agent-flow" className="py-16 lg:py-20">
        <Motion variant="fadeUp">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue">
              agent flow
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              From payment intent to execution decision.
            </h2>
          </div>
        </Motion>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {flowSteps.map((step, index) => (
            <Motion
              key={step.number}
              variant="fadeUp"
              delay={index === 0 ? "100" : index === 1 ? "200" : "300"}
            >
              <Card className="h-full p-8 transition hover:-translate-y-1 hover:bg-paper-soft">
                <p className="text-sm font-black text-blue">{step.number}</p>
                <h3 className="mt-8 text-3xl font-black leading-tight tracking-[-0.05em]">
                  {step.title}
                </h3>
                <p className="mt-5 text-lg leading-8 text-muted">{step.text}</p>
              </Card>
            </Motion>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <Motion variant="slideRight">
          <div className="rounded-[3rem] bg-ink p-8 text-paper sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-paper/45">
              engine
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              Evidence backed, not vibes.
            </h2>
            <p className="mt-6 text-lg leading-8 text-paper/65">
              PayGuard combines transaction decoding, live chain reads, contract
              intelligence, reputation signals, simulation, and policy scoring.
            </p>
          </div>
        </Motion>

        <div className="grid gap-5 md:grid-cols-2">
          {engineChecks.map((check, index) => (
            <Motion key={check.title} variant="fadeUp" delay={index < 2 ? "100" : "200"}>
              <Card className="h-full p-8 transition hover:-translate-y-1 hover:bg-paper-soft">
                <h3 className="text-3xl font-black leading-tight tracking-[-0.05em]">
                  {check.title}
                </h3>
                <p className="mt-5 text-lg leading-8 text-muted">{check.text}</p>
              </Card>
            </Motion>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <Motion variant="fadeUp">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue">
              croo commerce
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              The scan engine becomes a paid agent service.
            </h2>
            <p className="mt-6 text-xl leading-9 text-muted">
              The website proves the engine. The CAP endpoints make it discoverable,
              callable, and deliverable as an agent commerce capability.
            </p>
          </div>
        </Motion>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {capCards.map((card, index) => (
            <Motion
              key={card.title}
              variant="fadeUp"
              delay={index === 0 ? "100" : index === 1 ? "200" : "300"}
            >
              <Card className="h-full p-8 transition hover:-translate-y-1 hover:bg-paper-soft">
                <h3 className="text-3xl font-black leading-tight tracking-[-0.05em]">
                  {card.title}
                </h3>
                <p className="mt-5 text-lg leading-8 text-muted">{card.text}</p>
              </Card>
            </Motion>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-20">
        <Motion variant="slideRight">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue">
              api surface
            </p>
            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">
              Built for humans and agents.
            </h2>
            <p className="mt-6 max-w-xl text-xl leading-9 text-muted">
              Humans can use the scan page. Agents can call the manifest, capability,
              scan, and CAP order endpoints.
            </p>
          </div>
        </Motion>

        <Motion variant="slideLeft" delay="100">
          <Card className="p-5 sm:p-6">
            <div className="grid gap-3">
              {endpoints.map(([name, method, path]) => (
                <EndpointRow key={path} name={name} method={method} path={path} />
              ))}
            </div>
          </Card>
        </Motion>
      </section>

      <section className="py-16 pb-24">
        <Motion variant="fadeUp">
          <Card className="grid gap-8 overflow-hidden border-blue/20 bg-blue-soft p-8 text-ink sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-blue">
                ready to test
              </p>
              <h2 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-ink">
                Run the WETH approval scan and see PayGuard block it.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 tracking-[0.005em] text-muted">
                The demo uses live Base chain evidence and returns a machine readable
                BLOCK decision before signing.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/scan">Open scanner</ButtonLink>
              <ButtonLink href="/api/cap/capability" variant="secondary">
                View capability
              </ButtonLink>
            </div>
          </Card>
        </Motion>
      </section>
    </Shell>
  );
}

function DecisionPill({
  tone,
  label,
}: {
  tone: "green" | "orange" | "red";
  label: string;
}) {
  const toneClass = {
    green: "bg-green-soft text-green",
    orange: "bg-orange-soft text-orange",
    red: "bg-red-soft text-red",
  }[tone];

  return (
    <div className={`rounded-[2rem] px-5 py-4 text-center font-black ${toneClass}`}>
      {label}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-canvas px-5 py-4">
      <span className="text-sm font-black text-muted">{label}</span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}

function EndpointRow({
  name,
  method,
  path,
}: {
  name: string;
  method: string;
  path: string;
}) {
  return (
    <div className="grid gap-3 rounded-[2rem] bg-canvas p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-lg font-black text-ink">{name}</p>
        <p className="mt-2 break-all font-mono text-sm font-bold text-muted">{path}</p>
      </div>

      <div className="w-fit rounded-full bg-blue-soft px-4 py-2 text-xs font-black text-blue">
        {method}
      </div>
    </div>
  );
}
