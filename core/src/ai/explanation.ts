import type { PayGuardAiExplanation, PayGuardReport } from "../types";

export type AiExplanationOptions = {
  provider: "gemini";
  apiKey?: string;
  model?: string;
  enabled?: boolean;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function compactReport(report: PayGuardReport) {
  return {
    scanId: report.scanId,
    decision: report.decision,
    canContinue: report.canContinue,
    riskScore: report.riskScore,
    riskLevel: report.riskLevel,
    summary: report.summary,
    decodedAction: report.decodedAction,
    protocol: report.protocol,
    contractIntelligence: {
      address: report.contractIntelligence.address,
      chainName: report.contractIntelligence.chainName,
      hasCode: report.contractIntelligence.hasCode,
      bytecodeSize: report.contractIntelligence.bytecodeSize,
      proxy: report.contractIntelligence.proxy,
      verification: report.contractIntelligence.verification,
      reputation: report.contractIntelligence.reputation,
      explorer: report.contractIntelligence.explorer,
    },
    chainEvidence: {
      chainName: report.chainEvidence.chainName,
      token: report.chainEvidence.token,
      tokenBalanceRaw: report.chainEvidence.tokenBalanceRaw,
      currentAllowanceRaw: report.chainEvidence.currentAllowanceRaw,
      simulation: report.chainEvidence.simulation,
    },
    failedPolicyChecks: report.policyChecks.filter((check) => !check.passed),
    nextAction: report.nextAction,
  };
}

function extractText(data: GeminiResponse) {
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() ?? ""
  );
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini did not return JSON.");
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as PayGuardAiExplanation;
}

function fallbackExplanation(report: PayGuardReport): PayGuardAiExplanation {
  return {
    provider: "deterministic",
    title:
      report.decision === "ALLOW"
        ? "This action looks acceptable"
        : report.decision === "WARN"
          ? "This action needs review"
          : "This action should be stopped",
    plainEnglishSummary: report.summary,
    userRiskExplanation: report.reasons.join(" "),
    agentInstruction: report.canContinue
      ? "The calling agent may continue after confirming the business purpose."
      : "The calling agent should pause and request manual review or a safer action.",
    saferAlternative:
      report.decision === "ALLOW"
        ? "No safer alternative is required based on the current evidence."
        : "Use a limited approval, verify the contract, or request a direct transfer instead of broad spending authority.",
  };
}

export async function createAiExplanation(
  report: PayGuardReport,
  options?: AiExplanationOptions,
): Promise<PayGuardAiExplanation | undefined> {
  if (!options?.enabled) {
    return undefined;
  }

  if (!options.apiKey) {
    return fallbackExplanation(report);
  }

  const model = options.model ?? "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options.apiKey}`;

  const prompt = `
You are PayGuard, a before signing Web3 payment safety agent.

You must not change the PayGuard decision.
You must explain the report clearly for a human and for an autonomous buyer agent.
Use only the structured report data.
Do not invent facts.
Do not claim funds moved.
Do not say this is guaranteed safe.

Return JSON only with this exact shape:
{
  "provider": "gemini",
  "title": "string",
  "plainEnglishSummary": "string",
  "userRiskExplanation": "string",
  "agentInstruction": "string",
  "saferAlternative": "string"
}

Structured report:
${JSON.stringify(compactReport(report), null, 2)}
`.trim();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      return fallbackExplanation(report);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = extractText(data);

    if (!text) {
      return fallbackExplanation(report);
    }

    return extractJson(text);
  } catch {
    return fallbackExplanation(report);
  }
}
