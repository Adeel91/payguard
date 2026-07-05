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

type ContractIntelligence = {
  source: "rpc";
  address: string;
  chainId: number;
  chainName: string;
  hasCode: boolean;
  bytecodeSize: number;
  bytecodeHash?: string;
  nativeBalanceWei: string;
  proxy: {
    isProxy: boolean;
    proxyType: string;
    implementationAddress?: string;
    adminAddress?: string;
    beaconAddress?: string;
    evidence: string[];
  };
  verification: {
    provider: string;
    checked: boolean;
    verified: boolean;
    contractName?: string;
    matchType?: string;
    sourceId?: string;
    evidence: string[];
    error?: string;
  };
  reputation: {
    provider: string;
    checked: boolean;
    riskFlags: string[];
    evidence: string[];
    error?: string;
  };
};

type Protocol = {
  protocol: string;
  actionLabel: string;
  confidence: number;
  evidence: string[];
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
  contractIntelligence?: ContractIntelligence;
  protocol?: Protocol;
  policyChecks?: PolicyCheck[];
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

              <Panel title="decoded action">
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  {getDecodedTitle(report.decodedAction)}
                </p>

                <div className="mt-5 grid gap-3">
                  {decodedRows.map((row) => (
                    <InfoRow
                      key={`${row.label}:${row.value}`}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </Panel>

              {report.protocol && (
                <Panel title="protocol">
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                    {report.protocol.protocol}
                  </p>
                  <p className="mt-2 font-bold text-muted">
                    {report.protocol.actionLabel}
                  </p>
                  <InfoRow
                    label="Confidence"
                    value={`${Math.round(report.protocol.confidence * 100)}%`}
                  />

                  <div className="mt-3 grid gap-3">
                    {report.protocol.evidence.map((item) => (
                      <InfoRow key={item} label="Evidence" value={item} />
                    ))}
                  </div>
                </Panel>
              )}

              {report.contractIntelligence && (
                <Panel title="contract intelligence">
                  <div className="grid gap-3">
                    <InfoRow
                      label="Address"
                      value={report.contractIntelligence.address}
                    />
                    <InfoRow
                      label="Bytecode"
                      value={
                        report.contractIntelligence.hasCode
                          ? `${report.contractIntelligence.bytecodeSize} bytes`
                          : "No deployed code"
                      }
                    />
                    <InfoRow
                      label="Bytecode hash"
                      value={report.contractIntelligence.bytecodeHash ?? "Unavailable"}
                    />
                    <InfoRow
                      label="Proxy"
                      value={
                        report.contractIntelligence.proxy.isProxy
                          ? report.contractIntelligence.proxy.proxyType
                          : "No standard proxy detected"
                      }
                    />
                    {report.contractIntelligence.proxy.implementationAddress && (
                      <InfoRow
                        label="Implementation"
                        value={report.contractIntelligence.proxy.implementationAddress}
                      />
                    )}
                    <InfoRow
                      label="Verification"
                      value={
                        report.contractIntelligence.verification.verified
                          ? (report.contractIntelligence.verification.contractName ??
                            "Verified source found")
                          : "No verified source found"
                      }
                    />
                    <InfoRow
                      label="Reputation"
                      value={
                        report.contractIntelligence.reputation.checked
                          ? report.contractIntelligence.reputation.riskFlags.length
                            ? `${report.contractIntelligence.reputation.riskFlags.length} risk flag(s)`
                            : "No known risk flags"
                          : "Reputation lookup unavailable"
                      }
                    />
                  </div>
                </Panel>
              )}

              {report.chainEvidence && (
                <Panel title="chain evidence">
                  <div className="grid gap-3">
                    <InfoRow label="Chain" value={report.chainEvidence.chainName} />
                    <InfoRow
                      label="Target code"
                      value={
                        report.chainEvidence.targetHasCode
                          ? `${report.chainEvidence.targetBytecodeSize} bytes`
                          : "No deployed code"
                      }
                    />
                    <InfoRow
                      label="Token"
                      value={
                        report.chainEvidence.token.symbol
                          ? `${report.chainEvidence.token.name ?? "Unknown"} (${report.chainEvidence.token.symbol})`
                          : "Not detected"
                      }
                    />
                    <InfoRow
                      label="Simulation"
                      value={
                        report.chainEvidence.simulation.success ? "Succeeded" : "Failed"
                      }
                    />
                    {report.chainEvidence.currentAllowanceRaw && (
                      <InfoRow
                        label="Current allowance raw"
                        value={report.chainEvidence.currentAllowanceRaw}
                      />
                    )}
                  </div>
                </Panel>
              )}

              <Panel title="next action">
                <p className="mt-2 text-lg font-black">{report.nextAction}</p>
              </Panel>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-[2rem] bg-paper p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-muted">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-canvas p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 break-all text-sm font-black leading-6 text-ink">{value}</p>
    </div>
  );
}
