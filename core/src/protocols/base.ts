import type { ChainEvidence, DecodedAction, PolicyCheck } from "../types";

export type ProtocolAnalysis = {
  protocol: string;
  actionLabel: string;
  confidence: number;
  evidence: string[];
  checks: PolicyCheck[];
};

export type ProtocolAnalyzer = {
  id: string;
  canAnalyze(action: DecodedAction): boolean;
  analyze(action: DecodedAction, evidence: ChainEvidence): ProtocolAnalysis;
};
