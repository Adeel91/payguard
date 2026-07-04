import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Motion } from "@/components/ui/Motion";
import { Shell } from "@/components/ui/Shell";

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

const reviewRows = [
  ["Action", "Token approval"],
  ["Recipient", "Unknown contract"],
  ["Impact", "Assets may move later"],
  ["Next", "Do not sign"],
];

const infoCards = [
  {
    title: "For users",
    text: "Paste a transaction or approval and get a plain language safety decision before signing.",
  },
  {
    title: "For agents",
    text: "A CROO buyer agent hires PayGuard before sending USDC or executing an on chain action.",
  },
  {
    title: "For CROO",
    text: "PayGuard becomes a paid safety dependency for agent commerce, wallets, DeFi agents, and marketplace flows.",
  },
];

export default function Home() {
  return (
    <Shell>
      <SiteHeader />

      <section className="grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch lg:py-16">
        <Motion variant="slideRight">
          <Card className="relative overflow-hidden sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full bg-blue-soft opacity-70 blur-2xl sm:block" />

            <Badge tone="green">checks before funds move</Badge>

            <h1 className="mt-10 max-w-3xl text-6xl font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
              Your wallet should ask first.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
              PayGuard sits before a Web3 payment, token approval, contract call, or CROO
              agent payment. It explains what is about to happen and returns a clear
              Allow, Warn, or Block decision.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/scan">Scan a payment</ButtonLink>
              <ButtonLink href="#flow" variant="secondary">
                See how it works
              </ButtonLink>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {checks.map((check, index) => (
                <Motion
                  key={check}
                  variant="fadeUp"
                  delay={
                    index === 0
                      ? "100"
                      : index === 1
                        ? "200"
                        : index === 2
                          ? "300"
                          : "400"
                  }
                >
                  <div className="rounded-3xl border border-line bg-canvas px-4 py-4 text-sm font-black text-muted transition hover:-translate-y-1 hover:bg-paper-soft hover:text-ink">
                    {check}
                  </div>
                </Motion>
              ))}
            </div>
          </Card>
        </Motion>

        <Motion variant="slideLeft" delay="100">
          <div
            id="review"
            className="relative grid min-h-full gap-5 rounded-[3rem] border border-line bg-paper-soft p-5 brand-shadow"
          >
            <Motion variant="floatSlow">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-paper p-6">
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 motion-scan bg-gradient-to-b from-blue-soft/0 via-blue-soft to-blue-soft/0 opacity-70" />

                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                      live payment review
                    </p>
                    <h2 className="mt-5 text-5xl font-black tracking-[-0.06em] text-red">
                      Block
                    </h2>
                  </div>

                  <div className="motion-breathe grid h-24 w-24 place-items-center rounded-[2rem] bg-red-soft text-center">
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
                  {reviewRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-3xl bg-canvas px-5 py-4"
                    >
                      <span className="text-sm font-black text-muted">{label}</span>
                      <span className="text-sm font-black text-ink">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Motion>

            <div className="grid gap-3 sm:grid-cols-3">
              <DecisionMini title="Allow" text="Continue safely" tone="green" />
              <DecisionMini title="Warn" text="Review first" tone="orange" />
              <DecisionMini title="Block" text="Stop action" tone="red" />
            </div>
          </div>
        </Motion>
      </section>

      <Motion variant="fadeUp" delay="200">
        <section className="py-4">
          <Card className="overflow-hidden p-5">
            <div className="relative grid gap-4 rounded-[2.4rem] bg-paper-soft p-5 md:grid-cols-[1fr_1.2fr_1fr] md:items-center">
              <div className="rounded-[2rem] bg-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                  source
                </p>
                <p className="mt-3 text-2xl font-black tracking-[-0.04em]">Wallet</p>
                <p className="mt-2 text-sm font-bold text-muted">
                  Payment or approval prepared
                </p>
              </div>

              <div className="relative h-24 overflow-hidden rounded-[2rem] border border-line bg-canvas">
                <div className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
                <div className="absolute top-1/2 h-5 w-16 -translate-y-1/2 rounded-full bg-blue motion-path" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="rounded-full bg-paper px-5 py-3 text-sm font-black text-blue brand-shadow">
                    PayGuard checks first
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                  result
                </p>
                <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  Allow, Warn, Block
                </p>
                <p className="mt-2 text-sm font-bold text-muted">
                  Decision returned before signing
                </p>
              </div>
            </div>
          </Card>
        </section>
      </Motion>

      <section id="flow" className="grid gap-5 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Motion variant="slideRight">
          <div className="rounded-[3rem] bg-ink p-8 text-paper sm:p-10">
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
        </Motion>

        <div className="grid gap-4">
          {steps.map((step, index) => (
            <Motion
              key={step.number}
              variant="slideLeft"
              delay={index === 0 ? "100" : index === 1 ? "200" : "300"}
            >
              <div className="grid gap-5 rounded-[2.5rem] border border-line bg-paper p-6 transition hover:-translate-y-1 sm:grid-cols-[4rem_1fr]">
                <div className="grid h-16 w-16 place-items-center rounded-[1.5rem] bg-blue-soft text-2xl font-black text-blue">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{step.text}</p>
                </div>
              </div>
            </Motion>
          ))}
        </div>
      </section>

      <section id="croo" className="grid gap-5 py-10 lg:grid-cols-3">
        {infoCards.map((card, index) => (
          <Motion
            key={card.title}
            variant="fadeUp"
            delay={index === 0 ? "100" : index === 1 ? "200" : "300"}
          >
            <Card className="h-full transition hover:-translate-y-1 hover:bg-paper-soft">
              <h3 className="text-3xl font-black tracking-[-0.05em]">{card.title}</h3>
              <p className="mt-4 leading-7 text-muted">{card.text}</p>
            </Card>
          </Motion>
        ))}
      </section>
    </Shell>
  );
}

function DecisionMini({
  title,
  text,
  tone,
}: {
  title: string;
  text: string;
  tone: "green" | "orange" | "red";
}) {
  const toneClass = {
    green: "bg-green-soft text-green",
    orange: "bg-orange-soft text-orange",
    red: "bg-red-soft text-red",
  }[tone];

  return (
    <div className={`rounded-[2rem] p-5 ${toneClass}`}>
      <p className="text-xl font-black">{title}</p>
      <p className="mt-2 text-sm font-bold opacity-70">{text}</p>
    </div>
  );
}
