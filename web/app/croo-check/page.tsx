"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextArea, TextInput } from "@/components/ui/Field";
import { Motion } from "@/components/ui/Motion";
import { Shell } from "@/components/ui/Shell";

type PreflightResult = {
  decision: "ALLOW" | "WARN" | "BLOCK";
  title: string;
  summary: string;
  reasons: string[];
  safeRequirements: string;
  agentUrl?: string;
};

function parseCrooAgentUrl(value: string) {
  try {
    const url = new URL(value.trim());

    if (url.hostname !== "agent.croo.network") {
      return undefined;
    }

    const match = url.pathname.match(/^\/agents\/([a-zA-Z0-9-]+)/);

    if (!match) {
      return undefined;
    }

    return {
      agentId: match[1],
      agentUrl: `https://agent.croo.network/agents/${match[1]}`,
    };
  } catch {
    return undefined;
  }
}

function buildSafeRequirements(agentUrl: string, purpose: string) {
  return `Please complete this task through CROO only.

Target CROO agent:
${agentUrl}

Purpose:
${purpose || "Small test order before using this agent for a larger task."}

Safety requirements:
- Do not request seed phrases, private keys, or wallet recovery phrases.
- Do not request off-platform payment.
- Do not request direct wallet access.
- Do not ask me to sign unrelated transactions.
- Keep all payment and delivery inside CROO.
- Return a clear result with proof of completion.
- If wallet interaction is required, explain exactly what will be signed before asking.

Expected output:
A concise result, evidence/proof of completion, and any links or transaction references if relevant.`;
}

export default function CrooCheckPage() {
  const [agentUrl, setAgentUrl] = useState("");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<PreflightResult | null>(null);

  function runCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = parseCrooAgentUrl(agentUrl);

    if (!parsed) {
      setResult({
        decision: "BLOCK",
        title: "Invalid CROO agent link",
        summary:
          "This does not look like a valid CROO Agent Store link. Do not hire from this link.",
        reasons: [
          "Expected a link like https://agent.croo.network/agents/agent-id",
          "PayGuard could not extract a CROO agent ID.",
        ],
        safeRequirements: "",
      });

      return;
    }

    const safeRequirements = buildSafeRequirements(parsed.agentUrl, purpose);

    setResult({
      decision: purpose.trim() ? "WARN" : "WARN",
      title: "CROO agent preflight ready",
      summary:
        "PayGuard generated safe hiring requirements. This is a preflight helper, not a full live reputation check yet.",
      reasons: [
        "The CROO agent link format is valid.",
        "Use a small test order first if you do not already trust this agent.",
        "Keep payment and delivery inside CROO.",
        "Do not share private keys, seed phrases, or sign unrelated transactions.",
      ],
      safeRequirements,
      agentUrl: parsed.agentUrl,
    });
  }

  const tone = result?.decision === "BLOCK" ? "red" : "orange";

  return (
    <Shell>
      <SiteHeader nav={false} />

      <section className="py-10 lg:py-14">
        <Motion variant="fadeUp">
          <div className="mx-auto max-w-4xl text-center">
            <Badge tone="blue">CROO Agent Preflight</Badge>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl">
              Check before hiring.
            </h1>

            <p className="mt-6 text-xl leading-9 text-muted">
              Paste a CROO agent link. PayGuard helps you create safer hiring requirements
              before you pay an agent.
            </p>
          </div>
        </Motion>
      </section>

      <section className="pb-16">
        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
          <Motion variant="slideRight">
            <form
              onSubmit={runCheck}
              className="rounded-[3rem] border border-line bg-paper-soft p-4 brand-shadow sm:p-5"
            >
              <div className="rounded-[2.5rem] bg-paper p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                  preflight request
                </p>

                <h2 className="mt-3 text-3xl font-black">CROO agent check</h2>

                <div className="mt-7 grid gap-4">
                  <TextInput
                    label="CROO agent link"
                    value={agentUrl}
                    onChange={setAgentUrl}
                    placeholder="https://agent.croo.network/agents/..."
                  />

                  <TextArea
                    label="What do you want to hire this agent for?"
                    value={purpose}
                    onChange={setPurpose}
                    placeholder="Example: I want to run a small test order before using this agent."
                  />

                  <Button>Check before hiring</Button>
                </div>
              </div>
            </form>
          </Motion>

          <Motion variant="slideLeft" delay="100">
            <Card className="min-h-[520px] bg-paper">
              {!result ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    result
                  </p>

                  <div className="mt-8 rounded-[2.5rem] bg-blue-soft p-8">
                    <p className="text-5xl font-black leading-none text-blue">
                      Waiting for link
                    </p>
                    <p className="mt-5 text-lg leading-8 text-muted">
                      Paste a CROO Agent Store link and PayGuard will generate safer
                      requirements before you hire.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-muted">
                    PayGuard preflight
                  </p>

                  <div
                    className={`mt-8 rounded-[2.5rem] p-8 ${
                      tone === "red" ? "bg-red-soft" : "bg-orange-soft"
                    }`}
                  >
                    <p
                      className={`text-5xl font-black leading-none ${
                        tone === "red" ? "text-red" : "text-orange"
                      }`}
                    >
                      {result.decision}
                    </p>

                    <p className="mt-5 text-2xl font-black leading-tight text-ink">
                      {result.title}
                    </p>

                    <p className="mt-4 text-lg leading-8 text-muted">{result.summary}</p>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {result.reasons.map((reason) => (
                      <div
                        key={reason}
                        className="rounded-3xl bg-canvas px-5 py-4 text-sm font-black leading-6 text-ink"
                      >
                        {reason}
                      </div>
                    ))}
                  </div>

                  {result.safeRequirements && (
                    <div className="mt-6 rounded-[2rem] bg-canvas p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-muted">
                        safe requirements
                      </p>

                      <pre className="mt-4 whitespace-pre-wrap break-words text-sm font-bold leading-6 text-ink">
                        {result.safeRequirements}
                      </pre>
                    </div>
                  )}

                  {result.agentUrl && (
                    <a
                      href={result.agentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 block rounded-2xl bg-ink px-5 py-4 text-center text-sm font-black text-paper transition hover:-translate-y-0.5"
                    >
                      Open agent on CROO
                    </a>
                  )}
                </>
              )}
            </Card>
          </Motion>
        </div>
      </section>
    </Shell>
  );
}
