import type { ChainEvidence, DecodedAction } from "../types";
import type { ProtocolAnalysis, ProtocolAnalyzer } from "./base";
import { erc20Analyzer } from "./erc20";
import { erc721Analyzer } from "./erc721";
import { unknownAnalyzer } from "./unknown";

const analyzers: ProtocolAnalyzer[] = [erc20Analyzer, erc721Analyzer, unknownAnalyzer];

export function analyzeProtocol(
  action: DecodedAction,
  evidence: ChainEvidence,
): ProtocolAnalysis {
  const analyzer = analyzers.find((item) => item.canAnalyze(action)) ?? unknownAnalyzer;

  return analyzer.analyze(action, evidence);
}