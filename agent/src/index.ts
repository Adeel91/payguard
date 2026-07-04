import { scanPayment } from "@payguard/core";

console.log("PayGuard agent started");

const report = scanPayment({
  chain: "base",
  targetAddress: "0x0000000000000000000000000000000000000000",
  purpose: "approve token spend before paying an agent"
});

console.log(report);