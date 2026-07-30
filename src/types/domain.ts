export type RegistrationStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "CONFIRMED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED"
  | "CANCELED"
  | "REFUNDED"
  | "WAITLIST";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED"
  | "REFUNDED"
  | "CHARGEBACK";

export type Committee = {
  id: string;
  acronym: string;
  name: string;
  topic: string;
  description: string;
  language: string;
  capacity: number;
  reservedSeats: number;
  confirmedSeats: number;
  active: boolean;
  accent: "cyan" | "green" | "magenta" | "yellow" | "purple";
};

export type Registration = {
  id: string;
  publicId: string;
  token: string;
  registrationNumber?: string;
  studentName: string;
  birthDate: string;
  studentRegistrationNumber: string;
  grade: string;
  classGroup: string;
  schoolUnit: string;
  studentEmail: string;
  studentPhone?: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianRelationship: string;
  committeeId: string;
  secondaryCommitteeId?: string;
  previousExperience?: string;
  accessibilityNotes?: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  checkoutUrl: string;
  reservedUntil: string;
  amount: number;
  createdAt: string;
  confirmedAt?: string;
  termsVersion: string;
  privacyVersion: string;
};

export type RegistrationFormData = Omit<
  Registration,
  | "id"
  | "publicId"
  | "token"
  | "registrationNumber"
  | "status"
  | "paymentStatus"
  | "checkoutUrl"
  | "reservedUntil"
  | "amount"
  | "createdAt"
  | "confirmedAt"
  | "termsVersion"
  | "privacyVersion"
>;
