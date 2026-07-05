import type { ReactNode } from "react";
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
  explorer: {
    provider: string;
    checked: boolean;
    explorerUrl?: string;
    creatorAddress?: string;
    creationTransactionHash?: string;
    creationBlockNumber?: number;
    createdAt?: string;
    contractName?: string;
    isContract?: boolean;
    isVerified?: boolean;
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
  aiExplanation?: {
    provider: string;
    title: string;
    plainEnglishSummary: string;
    userRiskExplanation: string;
    agentInstruction: string;
    saferAlternative: string;
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

function formatDate(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function compact(value: string) {
  if (value.length <= 44) return value;

  if (value.startsWith("0x")) {
    return `${value.slice(0, 14)}…${value.slice(-10)}`;
  }

  return `${value.slice(0, 44)}…`;
}

export function ReportCard({ report }: { report: Report }) {
  const tone = getDecisionTone(report.decision);
  const decodedRows = getDecodedRows(report.decodedAction);
  const failedChecks = (report.policyChecks ?? []).filter((check) => !check.passed);
  const passedChecks = (report.policyChecks ?? []).filter((check) => check.passed);

  return (
    <section className="pb-16">
      <div className="rounded-[3rem] border border-line bg-paper p-4 brand-shadow sm:p-6">
        <div className="grid gap-5 2xl:grid-cols-[0.62fr_1.38fr] 2xl:items-start">
          <aside className="rounded-[2.5rem] bg-paper-soft p-5 sm:p-6">
            <DecisionBadge decision={report.decision} riskScore={report.riskScore} />

            <div className="mt-5 grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
              <SummaryMetric label="Risk level" value={report.riskLevel ?? "Unknown"} />
              <SummaryMetric label="Failed" value={String(failedChecks.length)} />
              <SummaryMetric label="Passed" value={String(passedChecks.length)} />
            </div>

            <div className="mt-5 rounded-[2rem] bg-paper p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                summary
              </p>
              <p className="mt-3 text-lg font-black leading-8 text-ink">
                {report.summary}
              </p>
              <p className="mt-3 font-bold leading-7 text-muted">{report.nextAction}</p>
            </div>

            {report.aiExplanation && (
              <div className="mt-5 rounded-[2rem] bg-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                  ai explanation
                </p>

                <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
                  {report.aiExplanation.title}
                </p>

                <p className="mt-3 font-bold leading-7 text-muted">
                  {report.aiExplanation.plainEnglishSummary}
                </p>

                <div className="mt-4 grid gap-3">
                  <CompactText
                    label="Risk"
                    value={report.aiExplanation.userRiskExplanation}
                  />
                  <CompactText
                    label="Agent"
                    value={report.aiExplanation.agentInstruction}
                  />
                  <CompactText
                    label="Safer path"
                    value={report.aiExplanation.saferAlternative}
                  />
                </div>
              </div>
            )}

            {report.checkedAt && (
              <p className="mt-4 text-sm font-bold text-muted">
                Checked at {new Date(report.checkedAt).toLocaleString()}
              </p>
            )}
          </aside>

          <div className="min-w-0">
            <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
              <Section
                title="decoded action"
                headline={getDecodedTitle(report.decodedAction)}
              >
                <InfoGrid>
                  {decodedRows.map((row) => (
                    <InfoTile
                      key={`${row.label}:${row.value}`}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </InfoGrid>
              </Section>

              {report.protocol && (
                <Section title="protocol" headline={report.protocol.protocol}>
                  <InfoGrid>
                    <InfoTile label="Action" value={report.protocol.actionLabel} />
                    <InfoTile
                      label="Confidence"
                      value={`${Math.round(report.protocol.confidence * 100)}%`}
                    />
                  </InfoGrid>
                  <EvidenceList items={report.protocol.evidence} />
                </Section>
              )}

              {report.chainEvidence && (
                <Section title="chain evidence" headline={report.chainEvidence.chainName}>
                  <InfoGrid>
                    <InfoTile
                      label="Target code"
                      value={
                        report.chainEvidence.targetHasCode
                          ? `${report.chainEvidence.targetBytecodeSize} bytes`
                          : "No deployed code"
                      }
                    />
                    <InfoTile
                      label="Token"
                      value={
                        report.chainEvidence.token.symbol
                          ? `${report.chainEvidence.token.name ?? "Unknown"} (${report.chainEvidence.token.symbol})`
                          : "Not detected"
                      }
                    />
                    <InfoTile
                      label="Simulation"
                      value={
                        report.chainEvidence.simulation.success ? "Succeeded" : "Failed"
                      }
                    />
                    {report.chainEvidence.currentAllowanceRaw && (
                      <InfoTile
                        label="Allowance raw"
                        value={report.chainEvidence.currentAllowanceRaw}
                      />
                    )}
                    {report.chainEvidence.tokenBalanceRaw && (
                      <InfoTile
                        label="Balance raw"
                        value={report.chainEvidence.tokenBalanceRaw}
                      />
                    )}
                  </InfoGrid>
                </Section>
              )}

              {report.contractIntelligence && (
                <Section
                  title="contract intelligence"
                  headline={
                    report.contractIntelligence.explorer.contractName ??
                    report.contractIntelligence.verification.contractName ??
                    "Target contract"
                  }
                  className="xl:col-span-2 2xl:col-span-3"
                >
                  <InfoGrid wide>
                    <InfoTile
                      label="Address"
                      value={report.contractIntelligence.address}
                    />
                    <InfoTile
                      label="Bytecode"
                      value={
                        report.contractIntelligence.hasCode
                          ? `${report.contractIntelligence.bytecodeSize} bytes`
                          : "No deployed code"
                      }
                    />
                    <InfoTile
                      label="Proxy"
                      value={
                        report.contractIntelligence.proxy.isProxy
                          ? report.contractIntelligence.proxy.proxyType
                          : "No standard proxy detected"
                      }
                    />
                    <InfoTile
                      label="Verification"
                      value={
                        report.contractIntelligence.verification.verified ||
                        report.contractIntelligence.explorer.isVerified
                          ? "Verified"
                          : "Not verified"
                      }
                    />
                    <InfoTile
                      label="Reputation"
                      value={
                        report.contractIntelligence.reputation.checked
                          ? report.contractIntelligence.reputation.riskFlags.length
                            ? `${report.contractIntelligence.reputation.riskFlags.length} risk flag(s)`
                            : "No known risk flags"
                          : "Unavailable"
                      }
                    />
                    <InfoTile
                      label="Explorer"
                      value={
                        report.contractIntelligence.explorer.checked
                          ? "Open Blockscout"
                          : "Unavailable"
                      }
                      href={report.contractIntelligence.explorer.explorerUrl}
                    />
                    {report.contractIntelligence.explorer.creatorAddress && (
                      <InfoTile
                        label="Creator"
                        value={report.contractIntelligence.explorer.creatorAddress}
                      />
                    )}
                    {report.contractIntelligence.explorer.createdAt && (
                      <InfoTile
                        label="Created"
                        value={
                          formatDate(report.contractIntelligence.explorer.createdAt) ??
                          report.contractIntelligence.explorer.createdAt
                        }
                      />
                    )}
                    {report.contractIntelligence.proxy.implementationAddress && (
                      <InfoTile
                        label="Implementation"
                        value={report.contractIntelligence.proxy.implementationAddress}
                      />
                    )}
                    {report.contractIntelligence.explorer.creationTransactionHash && (
                      <InfoTile
                        label="Creation tx"
                        value={
                          report.contractIntelligence.explorer.creationTransactionHash
                        }
                      />
                    )}
                  </InfoGrid>
                </Section>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[2.5rem] bg-paper-soft p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                policy checks
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                Evidence based verdict
              </h2>
            </div>

            <p className="text-sm font-black text-muted">
              {failedChecks.length} failed · {passedChecks.length} passed
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {(report.policyChecks ?? []).map((check, index) => (
              <PolicyCheckCard
                key={check.id}
                check={check}
                index={index}
                failTone={tone.number}
              />
            ))}
          </div>

          {!report.policyChecks?.length && (
            <div className="mt-5 rounded-[2rem] bg-paper p-5">
              <p className="font-black text-muted">No policy checks were returned.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-line bg-canvas p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function Section({
  title,
  headline,
  children,
  className = "",
}: {
  title: string;
  headline: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-[2.5rem] border border-line bg-paper-soft p-5 ${className}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">{title}</p>
      <p className="mt-2 break-words text-2xl font-black tracking-[-0.04em]">
        {headline}
      </p>
      <div className="mt-5 min-w-0">{children}</div>
    </div>
  );
}

function InfoGrid({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
      {children}
    </div>
  );
}

function InfoTile({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const shown = compact(value);

  const content = (
    <p className="mt-2 min-w-0 break-words text-sm font-black leading-6 text-ink">
      {shown}
    </p>
  );

  return (
    <div className="min-w-0 rounded-[1.5rem] border border-line bg-canvas p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">{label}</p>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          title={value}
          className="block min-w-0 underline decoration-2 underline-offset-4"
        >
          {content}
        </a>
      ) : (
        <div title={value}>{content}</div>
      )}
    </div>
  );
}

function CompactText({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[1.5rem] bg-canvas p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 break-words text-sm font-bold leading-6 text-muted">{value}</p>
    </div>
  );
}

function EvidenceList({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <div className="mt-3 grid gap-2">
      {items.map((item) => (
        <p
          key={item}
          className="min-w-0 rounded-[1.25rem] bg-canvas p-3 text-sm font-bold leading-6 text-muted [overflow-wrap:anywhere]"
        >
          {item}
        </p>
      ))}
    </div>
  );
}

function PolicyCheckCard({
  check,
  index,
  failTone,
}: {
  check: PolicyCheck;
  index: number;
  failTone: string;
}) {
  return (
    <div className="grid min-w-0 gap-4 rounded-[2rem] bg-paper p-5 sm:grid-cols-[3rem_1fr]">
      <div
        className={`grid h-12 w-12 place-items-center rounded-2xl font-black ${
          check.passed ? "bg-green-soft text-green" : failTone
        }`}
      >
        {index + 1}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className="min-w-0 break-words font-black tracking-[-0.03em]">
            {check.title}
          </p>
          <p className="shrink-0 text-xs font-black uppercase tracking-[0.18em] text-muted">
            {check.passed ? "passed" : "failed"} · {check.severity}
          </p>
        </div>

        <p className="mt-2 min-w-0 font-bold leading-7 text-muted [overflow-wrap:anywhere]">
          {check.evidence}
        </p>
      </div>
    </div>
  );
}
