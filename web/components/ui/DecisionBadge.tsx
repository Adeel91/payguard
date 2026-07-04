export type Decision = "ALLOW" | "WARN" | "BLOCK";

export function getDecisionTone(decision: Decision) {
  if (decision === "ALLOW") {
    return {
      card: "bg-green-soft text-green",
      badge: "bg-green text-paper",
      number: "bg-green-soft text-green",
    };
  }

  if (decision === "WARN") {
    return {
      card: "bg-orange-soft text-orange",
      badge: "bg-orange text-paper",
      number: "bg-orange-soft text-orange",
    };
  }

  return {
    card: "bg-red-soft text-red",
    badge: "bg-red text-paper",
    number: "bg-red-soft text-red",
  };
}

export function DecisionBadge({
  decision,
  riskScore,
}: {
  decision: Decision;
  riskScore: number;
}) {
  const tone = getDecisionTone(decision);

  return (
    <div className={`rounded-[2.5rem] p-7 ${tone.card}`}>
      <p className="text-xs font-black uppercase tracking-[0.28em] opacity-60">
        PayGuard decision
      </p>

      <div className="mt-5 flex items-end justify-between gap-5">
        <h2 className="text-6xl font-black tracking-[-0.07em]">{decision}</h2>

        <div className={`rounded-[2rem] px-5 py-4 ${tone.badge}`}>
          <p className="text-xs font-black uppercase opacity-70">risk</p>
          <p className="text-3xl font-black">{riskScore}</p>
        </div>
      </div>
    </div>
  );
}
