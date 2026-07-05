import { DecisionBadge } from "./DecisionBadge";
import { getDecisionTone } from "./DecisionBadge";
import type { Decision } from "./DecisionBadge";

type DecodedAction =
  | {
      type: "ERC20_APPROVE";
      functionName: "approve";
      spender: string;
      amountRaw: string;
      unlimited: boolean;
    }
  | {
      type: "ERC20_TRANSFER";
      functionName: "transfer";
      recipient: string;
      amountRaw: string;
    }
  | {
      type: "ERC20_TRANSFER_FROM";
      functionName: "transferFrom";
      from: string;
      recipient: string;
      amountRaw: string;
    }
  | {
      type: "OPERATOR_APPROVAL";
      functionName: "setApprovalForAll";
      operator: string;
      approved: boolean;
    }
  | {
      type: "UNKNOWN_CALL";
      selector: string;
    };

type ChainEvidence = {
  chainId: number;
  chainName: string;
  targetHasCode: boolean;
  targetBytecodeSize: number;
  nativeBalanceWei: string;
  token: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  tokenBalanceRaw?: string;
  currentAllowanceRaw?: string;
  simulation: {
    attempted: boolean;
    success: boolean;
    error?: string;
  };
};

type PolicyCheck = {
  id: string;
  title: string;
  passed: boolean;
  severity: string;
  evidence: string;
};

export type Report = {
  decision: Decision;
  riskScore: number;
  riskLevel?: string;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt?: string;
  decodedAction?: DecodedAction;
  chainEvidence?: ChainEvidence;
  policyChecks?: PolicyCheck[];
  protocol?: {
    protocol: string;
    actionLabel: string;
    confidence: number;
    evidence: string[];
  };
};

function getDecodedTitle(action?: DecodedAction) {
  if (!action) return "No decoded action";

  if (action.type === "ERC20_APPROVE") return "ERC20 approval";
  if (action.type === "ERC20_TRANSFER") return "ERC20 transfer";
  if (action.type === "ERC20_TRANSFER_FROM") return "ERC20 transferFrom";
  if (action.type === "OPERATOR_APPROVAL") return "Operator approval";

  return "Unknown contract call";
}

function getDecodedRows(action?: DecodedAction) {
  if (!action) {
    return [{ label: "Status", value: "No decoded action was returned." }];
  }

  if (action.type === "ERC20_APPROVE") {
    return [
      { label: "Function", value: action.functionName },
      { label: "Spender", value: action.spender },
      { label: "Amount raw", value: action.amountRaw },
      { label: "Unlimited approval", value: action.unlimited ? "Yes" : "No" },
    ];
  }

  if (action.type === "ERC20_TRANSFER") {
    return [
      { label: "Function", value: action.functionName },
      { label: "Recipient", value: action.recipient },
      { label: "Amount raw", value: action.amountRaw },
    ];
  }

  if (action.type === "ERC20_TRANSFER_FROM") {
    return [
      { label: "Function", value: action.functionName },
      { label: "From", value: action.from },
      { label: "Recipient", value: action.recipient },
      { label: "Amount raw", value: action.amountRaw },
    ];
  }

  if (action.type === "OPERATOR_APPROVAL") {
    return [
      { label: "Function", value: action.functionName },
      { label: "Operator", value: action.operator },
      { label: "Approved", value: action.approved ? "Yes" : "No" },
    ];
  }

  return [{ label: "Selector", value: action.selector }];
}

export function ReportCard({ report }: { report: Report }) {
  const tone = getDecisionTone(report.decision);
  const decodedRows = getDecodedRows(report.decodedAction);

  return (
    <section className="pb-16">
      <div className="rounded-[3rem] border border-line bg-paper p-5 brand-shadow">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <DecisionBadge decision={report.decision} riskScore={report.riskScore} />

            <div className="mt-5 rounded-[2rem] bg-paper-soft p-5 text-ink">
              <p className="text-lg leading-8 text-muted">{report.summary}</p>

              <div className="mt-5 rounded-[2rem] bg-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">
                  decoded action
                </p>

                {report.protocol && (
                  <div className="mt-5 rounded-[2rem] bg-paper p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
                      Protocol
                    </p>

                    <p className="mt-2 text-2xl font-black">{report.protocol.protocol}</p>

                    <p className="mt-2 font-bold text-muted">
                      {report.protocol.actionLabel}
                    </p>

                    <div className="mt-4 grid gap-2">
                      {report.protocol.evidence.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-line bg-canvas p-3 text-sm font-bold"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  {getDecodedTitle(report.decodedAction)}
                </p>

                <div className="mt-5 grid gap-3">
                  {decodedRows.map((row) => (
                    <div
                      key={`${row.label}:${row.value}`}
                      className="rounded-[1.5rem] border border-line bg-canvas p-4"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
                        {row.label}
                      </p>
                      <p className="mt-2 break-all text-sm font-black leading-6 text-ink">
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {report.chainEvidence && (
                <div className="mt-5 rounded-[2rem] bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">
                    chain evidence
                  </p>

                  <div className="mt-5 grid gap-3">
                    <EvidenceRow label="Chain" value={report.chainEvidence.chainName} />
                    <EvidenceRow
                      label="Contract code"
                      value={
                        report.chainEvidence.targetHasCode
                          ? `${report.chainEvidence.targetBytecodeSize} bytes`
                          : "No deployed code"
                      }
                    />
                    <EvidenceRow
                      label="Token"
                      value={
                        report.chainEvidence.token.symbol
                          ? `${report.chainEvidence.token.name ?? "Unknown"} (${report.chainEvidence.token.symbol})`
                          : "Not detected"
                      }
                    />
                    <EvidenceRow
                      label="Simulation"
                      value={
                        report.chainEvidence.simulation.success ? "Succeeded" : "Failed"
                      }
                    />
                    {report.chainEvidence.currentAllowanceRaw && (
                      <EvidenceRow
                        label="Current allowance raw"
                        value={report.chainEvidence.currentAllowanceRaw}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="mt-5 rounded-[2rem] bg-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">
                  next action
                </p>
                <p className="mt-2 text-lg font-black">{report.nextAction}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-paper-soft p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
              policy checks
            </p>

            <div className="mt-5 grid gap-3">
              {(report.policyChecks ?? []).map((check, index) => (
                <div
                  key={check.id}
                  className="grid gap-4 rounded-[2rem] bg-paper p-5 sm:grid-cols-[3rem_1fr]"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl font-black ${
                      check.passed ? "bg-green-soft text-green" : tone.number
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-black tracking-[-0.03em]">{check.title}</p>
                    <p className="mt-2 font-bold leading-7 text-muted">
                      {check.evidence}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-muted">
                      {check.passed ? "passed" : "failed"} · {check.severity}
                    </p>
                  </div>
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
  );
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-canvas p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 break-all text-sm font-black leading-6 text-ink">{value}</p>
    </div>
  );
}
