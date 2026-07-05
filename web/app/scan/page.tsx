"use client";

import { useRef, useState, type FormEvent } from "react";
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
    label: "Risky approval",
    text: "Unlimited WETH approval. Best demo.",
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
    label: "Safe transfer",
    text: "ERC20 transfer to a recipient.",
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
    label: "Unknown call",
    text: "Unknown calldata selector.",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: BASE_WETH,
      transactionData:
        "0x123456780000000000000000000000007777777777777777777777777777777777777777",
      purpose: "Execute an unknown contract action",
    },
  },
  {
    label: "Invalid input",
    text: "Bad target address.",
    input: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: "not an address",
      transactionData: "0x",
      purpose: "Pay another agent",
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
  const resultRef = useRef<HTMLDivElement>(null);

  function applyPreset(preset: (typeof DEMO_PRESETS)[number]) {
    setChain(preset.input.chain);
    setWalletAddress(preset.input.walletAddress);
    setTargetAddress(preset.input.targetAddress);
    setTransactionData(preset.input.transactionData);
    setPurpose(preset.input.purpose);
    setReport(null);
    setError("");
  }

  function focusResult() {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  async function scan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setReport(null);
    setError("");
    focusResult();

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
      setError("Scan failed. Check the server and try again.");
    } finally {
      setLoading(false);
      focusResult();
    }
  }

  return (
    <Shell>
      <SiteHeader nav={false} />

      <section className="py-10 lg:py-14">
        <Motion variant="fadeUp">
          <div className="mx-auto max-w-4xl text-center">
            <Badge tone="blue">live PayGuard engine</Badge>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
              Scan before signing.
            </h1>

            <p className="mt-6 text-xl leading-9 text-muted">
              Paste calldata or use a preset. PayGuard checks the action and returns a
              clear ALLOW, WARN, or BLOCK decision.
            </p>
          </div>
        </Motion>
      </section>

      <section className="pb-12">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
          <Motion variant="slideRight">
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
                    <h2 className="mt-3 text-3xl font-black">Payment review</h2>
                  </div>

                  <Badge tone="green">Live scan</Badge>
                </div>

                <div className="relative mt-7">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-muted">
                    demo presets
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="rounded-3xl border border-line bg-canvas p-4 text-left transition hover:-translate-y-0.5 hover:bg-paper-soft"
                      >
                        <p className="text-sm font-black">{preset.label}</p>
                        <p className="mt-1 text-xs font-bold leading-5 text-muted">
                          {preset.text}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mt-7 grid gap-4">
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
                    label="Contract or recipient"
                    value={targetAddress}
                    onChange={setTargetAddress}
                    placeholder="0x..."
                  />

                  <TextArea
                    label="Transaction calldata"
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
                    {loading ? "Scanning..." : "Run PayGuard scan"}
                  </Button>
                </div>
              </div>
            </form>
          </Motion>

          <Motion variant="slideLeft" delay="100">
            <div ref={resultRef} className="xl:sticky xl:top-6">
              <ResultPanel report={report} error={error} loading={loading} />
            </div>
          </Motion>
        </div>
      </section>

      {report && (
        <section id="full-report" className="pb-16">
          <Motion variant="fadeUp">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue">
                full report
              </p>
              <h2 className="mt-3 text-4xl font-black">Evidence and policy details</h2>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">
                The summary above is the agent decision. The full report below shows the
                decoded action, chain evidence, contract intelligence, and policy checks.
              </p>
            </div>

            <ReportCard report={report} />
          </Motion>
        </section>
      )}
    </Shell>
  );
}

function ResultPanel({
  report,
  error,
  loading,
}: {
  report: Report | null;
  error: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="min-h-[560px] bg-paper">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
          scan running
        </p>

        <div className="mt-8 rounded-[2.5rem] bg-blue-soft p-8">
          <p className="text-4xl font-black leading-tight text-blue">
            Checking action...
          </p>
          <p className="mt-5 text-lg leading-8 text-muted">
            PayGuard is decoding calldata, reading live chain evidence, checking contract
            intelligence, and scoring policy risk.
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <StatusRow label="Calldata" value="Decoding" />
          <StatusRow label="Chain evidence" value="Reading" />
          <StatusRow label="Policy" value="Scoring" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[560px] bg-paper">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
          scan error
        </p>

        <div className="mt-8 rounded-[2.5rem] bg-red-soft p-8">
          <p className="text-4xl font-black leading-tight text-red">Could not scan</p>
          <p className="mt-5 break-words text-lg leading-8 text-muted">{error}</p>
        </div>

        <p className="mt-6 text-lg font-bold leading-8 text-muted">
          Check the target address, calldata, and RPC configuration, then try again.
        </p>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className="min-h-[560px] bg-paper">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
          result
        </p>

        <div className="mt-8 rounded-[2.5rem] bg-blue-soft p-8">
          <p className="text-5xl font-black leading-none text-blue">Waiting for scan</p>
          <p className="mt-5 text-lg leading-8 text-muted">
            Choose <span className="font-black text-ink">Risky approval</span> for the
            strongest demo. The decision will appear here immediately after scanning.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
          <DecisionMini label="ALLOW" tone="green" />
          <DecisionMini label="WARN" tone="orange" />
          <DecisionMini label="BLOCK" tone="red" />
        </div>

        <div className="mt-6 rounded-[2rem] bg-canvas p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
            best demo
          </p>
          <p className="mt-3 text-lg font-black leading-7 text-ink">
            The risky approval preset scans Base WETH and should block unlimited token
            spending authority.
          </p>
        </div>
      </Card>
    );
  }

  const tone = getDecisionClass(report.decision);
  const canContinue = report.decision === "ALLOW";
  const decodedLabel = getDecodedLabel(report);

  return (
    <Card className="min-h-[560px] bg-paper">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
            PayGuard decision
          </p>

          <h2 className={`mt-6 text-6xl font-black leading-none ${tone.text}`}>
            {report.decision}
          </h2>
        </div>

        <div
          className={`grid h-24 w-24 shrink-0 place-items-center rounded-[2rem] ${tone.bg}`}
        >
          <div className="text-center">
            <p className={`text-xs font-black uppercase ${tone.text}`}>risk</p>
            <p className={`text-3xl font-black ${tone.text}`}>{report.riskScore}</p>
          </div>
        </div>
      </div>

      <div className={`mt-8 rounded-[2.5rem] p-6 ${tone.bg}`}>
        <p className={`text-2xl font-black leading-tight ${tone.text}`}>
          {canContinue ? "Agent can continue." : "Agent should not continue."}
        </p>
        <p className="mt-4 text-lg font-bold leading-8 text-muted">{report.summary}</p>
      </div>

      <div className="mt-6 grid gap-3">
        <StatusRow label="Decoded action" value={decodedLabel} />
        <StatusRow label="Risk level" value={report.riskLevel ?? "Unknown"} />
        <StatusRow label="Next action" value={report.nextAction} />
      </div>

      {report.reasons.length > 0 && (
        <div className="mt-6 rounded-[2rem] bg-canvas p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
            top reasons
          </p>

          <div className="mt-4 grid gap-3">
            {report.reasons.slice(0, 3).map((reason) => (
              <p
                key={reason}
                className="break-words text-sm font-bold leading-6 text-ink"
              >
                {reason}
              </p>
            ))}
          </div>
        </div>
      )}

      <a
        href="#full-report"
        className="mt-6 block rounded-2xl bg-ink px-5 py-4 text-center text-sm font-black text-paper transition hover:-translate-y-0.5"
      >
        View full evidence report
      </a>
    </Card>
  );
}

function DecisionMini({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "orange" | "red";
}) {
  const toneClass = {
    green: "bg-green-soft text-green",
    orange: "bg-orange-soft text-orange",
    red: "bg-red-soft text-red",
  }[tone];

  return (
    <div className={`rounded-[2rem] p-5 text-center font-black ${toneClass}`}>
      {label}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid gap-2 rounded-3xl bg-canvas px-5 py-4 sm:grid-cols-[9rem_1fr] sm:items-start">
      <span className="text-sm font-black text-muted">{label}</span>
      <span className="break-words text-sm font-black text-ink">{value}</span>
    </div>
  );
}

function getDecisionClass(decision: string) {
  if (decision === "ALLOW") {
    return {
      text: "text-green",
      bg: "bg-green-soft",
    };
  }

  if (decision === "WARN") {
    return {
      text: "text-orange",
      bg: "bg-orange-soft",
    };
  }

  return {
    text: "text-red",
    bg: "bg-red-soft",
  };
}

function getDecodedLabel(report: Report) {
  const action = report.decodedAction;

  if (!action) return "No decoded action";
  if (action.type === "ERC20_APPROVE") return "ERC20 approve";
  if (action.type === "ERC20_TRANSFER") return "ERC20 transfer";
  if (action.type === "ERC20_TRANSFER_FROM") return "ERC20 transferFrom";
  if (action.type === "OPERATOR_APPROVAL") return "Operator approval";

  return "Unknown contract call";
}
