import { DecisionBadge } from "./DecisionBadge";
import { getDecisionTone } from "./DecisionBadge";
import type { Decision } from "./DecisionBadge";

export type Report = {
  decision: Decision;
  riskScore: number;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt?: string;
};

export function ReportCard({ report }: { report: Report }) {
  const tone = getDecisionTone(report.decision);

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
