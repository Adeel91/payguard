"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Motion } from "@/components/ui/Motion";
import { ReportCard } from "@/components/ui/ReportCard";
import { Shell } from "@/components/ui/Shell";
import type { Report } from "@/components/ui/ReportCard";

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

    const response = await fetch("/api/scan", {
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

    const data = await response.json();

    if (data.report) {
      setReport(data.report);
    }

    setLoading(false);
  }

  return (
    <Shell>
      <SiteHeader nav={false} />

      <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-14">
        <Motion variant="slideRight">
          <Card className="relative overflow-hidden">
            <div className="absolute right-8 top-8 h-28 w-28 rounded-full bg-blue-soft opacity-70 blur-2xl" />

            <Badge tone="blue">scan before signing</Badge>

            <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl">
              Check the payment before it leaves.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Paste a recipient, wallet, transaction data, or payment purpose. PayGuard
              returns Allow, Warn, or Block before money moves.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Motion variant="fadeUp" delay="100">
                <MiniStat title="Base first" text="Focused EVM safety" />
              </Motion>
              <Motion variant="fadeUp" delay="200">
                <MiniStat title="Fast verdict" text="Clear decision" />
              </Motion>
              <Motion variant="fadeUp" delay="300">
                <MiniStat title="Agent ready" text="CAP compatible" />
              </Motion>
            </div>
          </Card>
        </Motion>

        <Motion variant="slideLeft" delay="100">
          <form
            onSubmit={scan}
            className="rounded-[3rem] border border-line bg-paper-soft p-5 brand-shadow"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] bg-paper p-6">
              <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 motion-scan bg-gradient-to-b from-blue-soft/0 via-blue-soft to-blue-soft/0 opacity-70" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    safety request
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                    Payment review
                  </h2>
                </div>

                <div className="motion-breathe">
                  <Badge tone="green">Live scan</Badge>
                </div>
              </div>

              <div className="relative mt-7 grid gap-4">
                <Motion variant="fadeUp" delay="100">
                  <SelectInput
                    label="Chain"
                    value={chain}
                    onChange={setChain}
                    options={[
                      { label: "Base", value: "base" },
                      { label: "Ethereum", value: "ethereum" },
                    ]}
                  />
                </Motion>

                <Motion variant="fadeUp" delay="100">
                  <TextInput
                    label="Wallet address"
                    value={walletAddress}
                    onChange={setWalletAddress}
                    placeholder="0x..."
                  />
                </Motion>

                <Motion variant="fadeUp" delay="200">
                  <TextInput
                    label="Recipient or contract address"
                    value={targetAddress}
                    onChange={setTargetAddress}
                    placeholder="0x..."
                  />
                </Motion>

                <Motion variant="fadeUp" delay="300">
                  <TextArea
                    label="Transaction data"
                    value={transactionData}
                    onChange={setTransactionData}
                    placeholder="0x..."
                  />
                </Motion>

                <Motion variant="fadeUp" delay="400">
                  <TextInput
                    label="Purpose"
                    value={purpose}
                    onChange={setPurpose}
                    placeholder="Example: approve token spend before paying an agent"
                  />
                </Motion>

                <Motion variant="fadeUp" delay="400">
                  <Button disabled={loading}>
                    {loading ? "Scanning payment..." : "Run PayGuard scan"}
                  </Button>
                </Motion>
              </div>
            </div>
          </form>
        </Motion>
      </section>

      {report && (
        <Motion variant="fadeUp">
          <ReportCard report={report} />
        </Motion>
      )}
    </Shell>
  );
}

function MiniStat({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-line bg-canvas p-4 transition hover:-translate-y-1 hover:bg-paper-soft">
      <p className="font-black tracking-[-0.03em]">{title}</p>
      <p className="mt-1 text-sm font-bold text-muted">{text}</p>
    </div>
  );
}
