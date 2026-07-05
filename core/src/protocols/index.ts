import type { ProtocolAnalyzer } from "./base";

const analyzers: ProtocolAnalyzer[] = [];

export function registerAnalyzer(analyzer: ProtocolAnalyzer) {
  analyzers.push(analyzer);
}

export function getAnalyzers() {
  return analyzers;
}
