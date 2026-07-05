"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectInput, TextArea, TextInput } from "@/components/ui/Field";
import { Motion } from "@/components/ui/Motion";
import { ReportCard } from "@/components/ui/ReportCard";
import { Shell } from "@/components/ui/Shell";
import type { Report } from "@/components/ui/ReportCard";

const BASE_WETH = "0x4200000000000000000000000000000000000006";

const DEMO_PRESETS = [
  {
    label: "Safe transfer",
    text: "ERC20 transfer to a recipient",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: BASE_WETH,
      transactionData:
        "0xa9059cbb00000000000000000000000033333333333333333333333333333333333333330000000000000000000000000000000000000000000000000000000000000064",
      purpose: "Send 100 raw WETH units to a known recipient",
    },
  },
  {
    label: "Risky approval",
    text: "Unlimited spender approval",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: BASE_WETH,
      transactionData:
        "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      purpose: "Approve token spend before paying an agent",
    },
  },
  {
    label: "Invalid input",
    text: "Bad target address",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: "not an address",
      transactionData: "0x",
      purpose: "Pay another agent",
    },
  },
  {
    label: "Unknown call",
    text: "Unknown calldata selector",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: BASE_WETH,
      transactionData:
        "0x123456780000000000000000000000007777777777777777777777777777777777777777",
      purpose: "Execute an unknown contract action",
    },
  },
];

export default function ScanPage() {
  const [chain, setChain] = useState("base");
  const [walletAddress, setWalletAddress] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [transactionData, setTransactionData] = useState("");
  const [purpose, setPurpose] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function applyPreset(preset: (typeof DEMO_PRESETS)[number]) {
    setChain(preset.input.chain);
    setWalletAddress(preset.input.walletAddress);
    setTargetAddress(preset.input.targetAddress);
    setTransactionData(preset.input.transactionData);
    setPurpose(preset.input.purpose);
    setReport(null);
    setError("");
  }

  async function scan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setReport(null);
    setError("");

    try {
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

      if (!response.ok) {
        setError(data.error ?? "Scan failed.");
        return;
      }

      if (!data.report) {
        setError("Scan completed but no report was returned.");
        return;
      }

      setReport(data.report);
    } catch {
      setError("Scan failed. Check the local server and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <SiteHeader nav={false} />

      <section className="py-8 lg:py-12">
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
          <Motion variant="slideRight">
            <Card className="relative overflow-hidden">
              <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-blue-soft opacity-70 blur-2xl" />

              <div className="relative">
                <Badge tone="blue">scan before signing</Badge>

                <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[0.92] tracking-[-0.06em] sm:text-6xl">
                  Real payment risk before the signature.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                  PayGuard decodes the calldata, checks live chain evidence, reviews
                  contract intelligence, and returns Allow, Warn, or Block.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <MiniStat title="Live RPC" text="Reads chain state" />
                  <MiniStat title="Security data" text="Proxy and reputation" />
                  <MiniStat title="Agent ready" text="CROO compatible" />
                </div>

                <div className="mt-6 rounded-[2rem] border border-line bg-canvas p-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">
                    best demo
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
                    Use Risky approval
                  </p>
                  <p className="mt-2 font-bold leading-7 text-muted">
                    It scans the real Base WETH contract and should show a clear Block
                    verdict for unlimited approval.
                  </p>
                </div>
              </div>
            </Card>
          </Motion>

          <Motion variant="slideLeft" delay="100">
            <form
              onSubmit={scan}
              className="rounded-[3rem] border border-line bg-paper-soft p-4 brand-shadow sm:p-5"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] bg-paper p-5 sm:p-6">
                <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 motion-scan bg-gradient-to-b from-blue-soft/0 via-blue-soft to-blue-soft/0 opacity-70" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

                <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
                  {DEMO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-3xl border border-line bg-canvas p-4 text-left transition hover:bg-paper-soft"
                    >
                      <p className="text-sm font-black tracking-[-0.03em]">
                        {preset.label}
                      </p>

                      <p className="mt-1 text-xs font-bold text-muted">{preset.text}</p>
                    </button>
                  ))}
                </div>

                <div className="relative mt-5 grid gap-4">
                  <SelectInput
                    label="Chain"
                    value={chain}
                    onChange={setChain}
                    options={[
                      { label: "Base", value: "base" },
                      { label: "Ethereum", value: "ethereum" },
                    ]}
                  />

                  <TextInput
                    label="Wallet address"
                    value={walletAddress}
                    onChange={setWalletAddress}
                    placeholder="0x..."
                  />

                  <TextInput
                    label="Recipient or contract address"
                    value={targetAddress}
                    onChange={setTargetAddress}
                    placeholder="0x..."
                  />

                  <TextArea
                    label="Transaction data"
                    value={transactionData}
                    onChange={setTransactionData}
                    placeholder="0x..."
                  />

                  <TextInput
                    label="Purpose"
                    value={purpose}
                    onChange={setPurpose}
                    placeholder="Example: approve token spend before paying an agent"
                  />

                  <Button disabled={loading}>
                    {loading ? "Scanning payment..." : "Run PayGuard scan"}
                  </Button>
                </div>
              </div>
            </form>
          </Motion>
        </div>
      </section>

      {error && (
        <Motion variant="fadeUp">
          <div className="mb-8 rounded-[2rem] border border-line bg-paper p-5 brand-shadow">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">
              scan error
            </p>
            <p className="mt-3 break-words text-lg font-black text-ink">{error}</p>
          </div>
        </Motion>
      )}

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
    <div className="rounded-3xl border border-line bg-canvas p-4">
      <p className="font-black tracking-[-0.03em]">{title}</p>
      <p className="mt-1 text-sm font-bold text-muted">{text}</p>
    </div>
  );
}
