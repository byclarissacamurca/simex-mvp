import type { PaymentStatus, RegistrationStatus } from "../types/domain";

export function normalizeGatewayStatus(rawStatus: string): PaymentStatus {
  const status = rawStatus.toUpperCase();

  if (["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(status)) return "PAID";
  if (["PENDING", "AWAITING_PAYMENT"].includes(status)) return "PENDING";
  if (["PROCESSING", "IN_ANALYSIS"].includes(status)) return "PROCESSING";
  if (["OVERDUE", "EXPIRED"].includes(status)) return "EXPIRED";
  if (["REFUNDED", "REFUND_REQUESTED"].includes(status)) return "REFUNDED";
  if (["CHARGEBACK"].includes(status)) return "CHARGEBACK";
  if (["CANCELED", "DELETED"].includes(status)) return "CANCELED";

  return "FAILED";
}

export function registrationStatusFromPayment(paymentStatus: PaymentStatus): RegistrationStatus {
  switch (paymentStatus) {
    case "PAID":
      return "CONFIRMED";
    case "PROCESSING":
      return "PAYMENT_PROCESSING";
    case "EXPIRED":
      return "PAYMENT_EXPIRED";
    case "CANCELED":
      return "CANCELED";
    case "REFUNDED":
      return "REFUNDED";
    case "FAILED":
    case "CHARGEBACK":
      return "PAYMENT_FAILED";
    case "CREATED":
    case "PENDING":
      return "PENDING_PAYMENT";
  }
}
