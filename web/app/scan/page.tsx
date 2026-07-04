"use client";

import Link from "next/link";
import { useState } from "react";

type Report = {
  decision: "ALLOW" | "WARN" | "BLOCK";
  riskScore: number;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt?: string;
};

function getDecisionStyles(decision: Report["decision"]) {
  if (decision === "ALLOW") {
    return {
      card: "bg-green-soft text-green",
      badge: "bg-green text-paper",
      ring: "border-green",
    };
  }

  if (decision === "WARN") {
    return {
      card: "bg-orange-soft text-orange",
      badge: "bg-orange text-paper",
      ring: "border-orange",
    };
  }

  return {
    card: "bg-red-soft text-red",
    badge: "bg-red text-paper",
    ring: "border-red",
  };
}

export default function ScanPage() {
  const [chain, setChain] = useState("base");
  const [walletAddress, setWalletAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [transactionData, setTransactionData] = useState("");
  const [purpose, setPurpose] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  async function scan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setReport(null);

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chain,
        walletAddress,
        targetAddress,
        transactionData,
        purpose,
      }),
    });

    const data = await res.json();

    setReport(data.report);
    setLoading(false);
  }

  const styles = report ? getDecisionStyles(report.decision) : null;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between rounded-[2rem] border border-line bg-paper px-5 py-4 brand-shadow">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-sm font-black text-paper">
              PG
            </div>

            <div>
              <p className="text-lg font-black leading-none tracking-[-0.03em]">
                PayGuard
              </p>
              <p className="mt-1 text-xs font-bold text-muted">payment scanner</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-full border border-line bg-canvas px-5 py-3 text-sm font-black text-ink transition hover:bg-paper-soft"
          >
            Home
          </Link>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-14">
          <div className="rounded-[3rem] border border-line bg-paper p-8 brand-shadow sm:p-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-blue-soft px-4 py-2 text-sm font-black text-blue">
              <span className="h-2.5 w-2.5 rounded-full bg-blue" />
              scan before signing
            </div>

            <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl">
              Check the payment before it leaves.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Paste a recipient, wallet, transaction data, or payment purpose. PayGuard
              returns Allow, Warn, or Block before money moves.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MiniInfo title="Base first" text="Focused EVM safety" />
              <MiniInfo title="Fast verdict" text="Clear decision" />
              <MiniInfo title="Agent ready" text="CAP compatible" />
            </div>
          </div>

          <form
            onSubmit={scan}
            className="rounded-[3rem] border border-line bg-paper-soft p-5 brand-shadow"
          >
            <div className="rounded-[2.5rem] bg-paper p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    safety request
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                    Payment review
                  </h2>
                </div>

                <div className="rounded-full bg-green-soft px-4 py-2 text-sm font-black text-green">
                  Live scan
                </div>
              </div>

              <div className="mt-7 grid gap-4">
                <div>
                  <label className="text-sm font-black text-muted">Chain</label>
                  <select
                    value={chain}
                    onChange={(event) => setChain(event.target.value)}
                    className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition focus:border-blue"
                  >
                    <option value="base">Base</option>
                    <option value="ethereum">Ethereum</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-black text-muted">Wallet address</label>
                  <input
                    value={walletAddress}
                    onChange={(event) => setWalletAddress(event.target.value)}
                    placeholder="0x..."
                    className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-muted">
                    Recipient or contract address
                  </label>
                  <input
                    value={targetAddress}
                    onChange={(event) => setTargetAddress(event.target.value)}
                    placeholder="0x..."
                    className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-muted">
                    Transaction data
                  </label>
                  <textarea
                    value={transactionData}
                    onChange={(event) => setTransactionData(event.target.value)}
                    placeholder="0x..."
                    className="mt-2 min-h-28 w-full resize-none rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
                  />
                </div>

                <div>
                  <label className="text-sm font-black text-muted">Purpose</label>
                  <input
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    placeholder="Example: approve token spend before paying an agent"
                    className="mt-2 w-full rounded-3xl border border-line bg-canvas px-5 py-4 font-bold text-ink outline-none transition placeholder:text-muted/50 focus:border-blue"
                  />
                </div>

                <button
                  disabled={loading}
                  className="mt-2 rounded-full bg-ink px-7 py-4 font-black text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Scanning payment..." : "Run PayGuard scan"}
                </button>
              </div>
            </div>
          </form>
        </section>

        {report && styles && (
          <section className="pb-16">
            <div className="rounded-[3rem] border border-line bg-paper p-5 brand-shadow">
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <div className={`rounded-[2.5rem] p-7 ${styles.card}`}>
                  <p className="text-xs font-black uppercase tracking-[0.28em] opacity-60">
                    PayGuard decision
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-5">
                    <h2 className="text-6xl font-black tracking-[-0.07em]">
                      {report.decision}
                    </h2>

                    <div className={`rounded-[2rem] px-5 py-4 ${styles.badge}`}>
                      <p className="text-xs font-black uppercase opacity-70">risk</p>
                      <p className="text-3xl font-black">{report.riskScore}</p>
                    </div>
                  </div>

                  <p className="mt-6 text-lg leading-8 opacity-75">{report.summary}</p>

                  <div className="mt-7 rounded-[2rem] bg-paper/70 p-5 text-ink">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">
                      next action
                    </p>
                    <p className="mt-2 text-lg font-black">{report.nextAction}</p>
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-paper-soft p-7">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    reasons
                  </p>

                  <div className="mt-5 grid gap-3">
                    {report.reasons.map((reason, index) => (
                      <div
                        key={reason}
                        className="grid gap-4 rounded-[2rem] bg-paper p-5 sm:grid-cols-[3rem_1fr]"
                      >
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-soft font-black text-blue">
                          {index + 1}
                        </div>

                        <p className="self-center font-bold leading-7 text-muted">
                          {reason}
                        </p>
                      </div>
                    ))}
                  </div>

                  {report.checkedAt && (
                    <p className="mt-5 text-sm font-bold text-muted">
                      Checked at {new Date(report.checkedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function MiniInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-line bg-canvas p-4">
      <p className="font-black tracking-[-0.03em]">{title}</p>
      <p className="mt-1 text-sm font-bold text-muted">{text}</p>
    </div>
  );
}
