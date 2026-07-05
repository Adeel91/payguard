import type { ChainEvidence, DecodedAction } from "../types";

import { bootstrapProtocols } from "./bootstrap";
import { getAnalyzers } from "./index";
import { unknownAnalyzer } from "./unknown";

export function analyzeProtocol(action: DecodedAction, evidence: ChainEvidence) {
  bootstrapProtocols();

  const analyzer = getAnalyzers().find((a) => a.canAnalyze(action)) ?? unknownAnalyzer;

  return analyzer.analyze(action, evidence);
}
