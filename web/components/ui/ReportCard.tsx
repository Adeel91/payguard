import { DecisionBadge } from "./DecisionBadge";
import { getDecisionTone } from "./DecisionBadge";
import type { Decision } from "./DecisionBadge";

type DecodedCall =
  | {
      kind: "none";
    }
  | {
      kind: "erc20Approve";
      functionName: "approve";
      spenderAddress: string;
      amount: string;
      isUnlimitedApproval: boolean;
    }
  | {
      kind: "erc20Transfer";
      functionName: "transfer";
      recipientAddress: string;
      amount: string;
    }
  | {
      kind: "erc20TransferFrom";
      functionName: "transferFrom";
      fromAddress: string;
      recipientAddress: string;
      amount: string;
    }
  | {
      kind: "setApprovalForAll";
      functionName: "setApprovalForAll";
      operatorAddress: string;
      approved: boolean;
    }
  | {
      kind: "unknownContractCall";
      selector?: string;
    };

export type Report = {
  decision: Decision;
  riskScore: number;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt?: string;
  decodedCall?: DecodedCall;
};

type DetailRow = {
  label: string;
  value: string;
  strong?: boolean;
};

function getDecodedTitle(decodedCall?: DecodedCall): string {
  if (!decodedCall || decodedCall.kind === "none") {
    return "No decoded calldata";
  }

  if (decodedCall.kind === "erc20Approve") {
    return "ERC20 approval";
  }

  if (decodedCall.kind === "erc20Transfer") {
    return "ERC20 transfer";
  }

  if (decodedCall.kind === "erc20TransferFrom") {
    return "ERC20 transferFrom";
  }

  if (decodedCall.kind === "setApprovalForAll") {
    return "NFT or token operator approval";
  }

  return "Unknown contract call";
}

function getDecodedRows(decodedCall?: DecodedCall): DetailRow[] {
  if (!decodedCall || decodedCall.kind === "none") {
    return [
      {
        label: "Status",
        value: "No transaction data was decoded.",
      },
    ];
  }

  if (decodedCall.kind === "erc20Approve") {
    return [
      {
        label: "Function",
        value: decodedCall.functionName,
      },
      {
        label: "Spender",
        value: decodedCall.spenderAddress,
      },
      {
        label: "Amount",
        value: decodedCall.amount,
      },
      {
        label: "Unlimited approval",
        value: decodedCall.isUnlimitedApproval ? "Yes" : "No",
        strong: decodedCall.isUnlimitedApproval,
      },
    ];
  }

  if (decodedCall.kind === "erc20Transfer") {
    return [
      {
        label: "Function",
        value: decodedCall.functionName,
      },
      {
        label: "Recipient",
        value: decodedCall.recipientAddress,
      },
      {
        label: "Amount",
        value: decodedCall.amount,
      },
    ];
  }

  if (decodedCall.kind === "erc20TransferFrom") {
    return [
      {
        label: "Function",
        value: decodedCall.functionName,
      },
      {
        label: "From",
        value: decodedCall.fromAddress,
      },
      {
        label: "Recipient",
        value: decodedCall.recipientAddress,
      },
      {
        label: "Amount",
        value: decodedCall.amount,
      },
    ];
  }

  if (decodedCall.kind === "setApprovalForAll") {
    return [
      {
        label: "Function",
        value: decodedCall.functionName,
      },
      {
        label: "Operator",
        value: decodedCall.operatorAddress,
      },
      {
        label: "Approved",
        value: decodedCall.approved ? "Yes" : "No",
        strong: decodedCall.approved,
      },
    ];
  }

  return [
    {
      label: "Selector",
      value: decodedCall.selector ?? "Unknown",
      strong: true,
    },
    {
      label: "Status",
      value: "PayGuard could not match this calldata to a known payment function.",
    },
  ];
}

export function ReportCard({ report }: { report: Report }) {
  const tone = getDecisionTone(report.decision);
  const decodedRows = getDecodedRows(report.decodedCall);

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

                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  {getDecodedTitle(report.decodedCall)}
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
              reasons
            </p>

            <div className="mt-5 grid gap-3">
              {report.reasons.map((reason, index) => (
                <div
                  key={reason}
                  className="grid gap-4 rounded-[2rem] bg-paper p-5 sm:grid-cols-[3rem_1fr]"
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl font-black ${tone.number}`}
                  >
                    {index + 1}
                  </div>

                  <p className="self-center font-bold leading-7 text-muted">{reason}</p>
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
