import { describe, expect, it } from "vitest";
import { normalizeGatewayStatus, registrationStatusFromPayment } from "../lib/status";

describe("payment status normalization", () => {
  it("maps approved Asaas statuses to internal paid status", () => {
    expect(normalizeGatewayStatus("CONFIRMED")).toBe("PAID");
    expect(registrationStatusFromPayment("PAID")).toBe("CONFIRMED");
  });

  it("maps expired payments without confirming registration", () => {
    expect(normalizeGatewayStatus("OVERDUE")).toBe("EXPIRED");
    expect(registrationStatusFromPayment("EXPIRED")).toBe("PAYMENT_EXPIRED");
  });
});
