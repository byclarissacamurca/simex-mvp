import type {
  CheckoutResult,
  CreateCheckoutInput,
  NormalizedPayment,
  NormalizedWebhookEvent,
  PaymentGateway,
} from "./gateway";

export class AsaasPaymentGateway implements PaymentGateway {
  constructor(
    private readonly config: {
      apiUrl: string;
      apiKey: string;
      webhookToken: string;
      appUrl: string;
    },
  ) {}

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    if (!this.config.apiKey) {
      return {
        provider: "asaas-mock",
        checkoutId: `mock-${input.registrationId}`,
        checkoutUrl: `${this.config.appUrl}/checkout-simulado?ref=${encodeURIComponent(input.externalReference)}`,
        status: "PENDING",
        expiresAt: input.expiresAt,
      };
    }

    throw new Error("Asaas API integration must run on the server with secrets isolated from the browser.");
  }

  async getPayment(): Promise<NormalizedPayment> {
    throw new Error("Payment lookup must be implemented in the server route before production.");
  }

  async validateWebhook(request: Request): Promise<boolean> {
    const receivedToken = request.headers.get("asaas-access-token");
    return Boolean(this.config.webhookToken && receivedToken === this.config.webhookToken);
  }

  async parseWebhook(request: Request): Promise<NormalizedWebhookEvent> {
    const payload = (await request.json()) as {
      id?: string;
      event?: string;
      payment?: {
        id?: string;
        externalReference?: string;
      };
    };

    return {
      provider: "asaas",
      providerEventId: payload.id ?? crypto.randomUUID(),
      eventType: payload.event ?? "UNKNOWN",
      paymentId: payload.payment?.id ?? "",
      externalReference: payload.payment?.externalReference ?? "",
    };
  }
}
