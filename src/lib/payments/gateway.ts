export type CreateCheckoutInput = {
  registrationId: string;
  externalReference: string;
  description: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  expiresAt: Date;
};

export type CheckoutResult = {
  provider: string;
  checkoutId: string;
  checkoutUrl: string;
  status: string;
  expiresAt?: Date;
};

export type NormalizedPayment = {
  providerPaymentId: string;
  externalReference: string;
  status: string;
  amount: number;
  currency: string;
  paidAt?: Date;
  rawStatus: string;
};

export type NormalizedWebhookEvent = {
  provider: string;
  providerEventId: string;
  eventType: string;
  paymentId: string;
  externalReference: string;
};

export interface PaymentGateway {
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult>;
  getPayment(paymentId: string): Promise<NormalizedPayment>;
  validateWebhook(request: Request): Promise<boolean>;
  parseWebhook(request: Request): Promise<NormalizedWebhookEvent>;
}
