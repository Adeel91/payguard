import { registerAnalyzer } from "./index";

import { erc20Analyzer } from "./erc20";
import { erc721Analyzer } from "./erc721";
import { unknownAnalyzer } from "./unknown";

let bootstrapped = false;

export function bootstrapProtocols() {
  if (bootstrapped) {
    return;
  }

  registerAnalyzer(erc20Analyzer);
  registerAnalyzer(erc721Analyzer);
  registerAnalyzer(unknownAnalyzer);

  bootstrapped = true;
}
