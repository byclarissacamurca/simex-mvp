import { committees as baseCommittees } from "../content/committees";
import { eventConfig } from "../content/event";
import type { Committee, Registration, RegistrationFormData } from "../types/domain";

const STORAGE_KEY = "simex.registrations.v1";
const RESERVATION_MINUTES = 60;

const nowIso = () => new Date().toISOString();

function randomCode(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 8).toUpperCase();
  return `${prefix}-${code}`;
}

export function loadRegistrations(): Registration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Registration[]) : [];
  } catch {
    return [];
  }
}

export function saveRegistrations(registrations: Registration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

export function getCommitteesWithLiveSeats(registrations = loadRegistrations()): Committee[] {
  return baseCommittees.map((committee) => {
    const liveReserved = registrations.filter(
      (registration) =>
        registration.committeeId === committee.id &&
        registration.status === "PENDING_PAYMENT" &&
        new Date(registration.reservedUntil).getTime() > Date.now(),
    ).length;
    const liveConfirmed = registrations.filter(
      (registration) => registration.committeeId === committee.id && registration.status === "CONFIRMED",
    ).length;

    return {
      ...committee,
      reservedSeats: committee.reservedSeats + liveReserved,
      confirmedSeats: committee.confirmedSeats + liveConfirmed,
    };
  });
}

export function availableSeats(committee: Committee) {
  return Math.max(committee.capacity - committee.reservedSeats - committee.confirmedSeats, 0);
}

export function createRegistration(input: RegistrationFormData) {
  const registrations = loadRegistrations();
  const duplicate = registrations.find(
    (registration) =>
      registration.studentRegistrationNumber.trim().toLowerCase() ===
        input.studentRegistrationNumber.trim().toLowerCase() &&
      registration.guardianEmail.trim().toLowerCase() === input.guardianEmail.trim().toLowerCase() &&
      !["CANCELED", "PAYMENT_EXPIRED"].includes(registration.status),
  );

  if (duplicate) {
    return {
      ok: false as const,
      reason: "duplicate",
      registration: duplicate,
    };
  }

  const committee = getCommitteesWithLiveSeats(registrations).find((item) => item.id === input.committeeId);
  if (!committee || availableSeats(committee) <= 0) {
    return {
      ok: false as const,
      reason: "full",
    };
  }

  const id = crypto.randomUUID();
  const token = randomCode("TOK");
  const publicId = randomCode("SIMEX");
  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString();
  const registration: Registration = {
    ...input,
    id,
    publicId,
    token,
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    checkoutUrl: `/checkout-simulado?token=${encodeURIComponent(token)}`,
    reservedUntil,
    amount: eventConfig.registrationFee,
    createdAt: nowIso(),
    termsVersion: eventConfig.termsVersion,
    privacyVersion: eventConfig.privacyVersion,
  };

  saveRegistrations([registration, ...registrations]);
  return { ok: true as const, registration };
}

export function updateRegistration(id: string, patch: Partial<Registration>) {
  const registrations = loadRegistrations();
  const next = registrations.map((registration) =>
    registration.id === id ? { ...registration, ...patch } : registration,
  );
  saveRegistrations(next);
  return next.find((registration) => registration.id === id);
}

export function simulatePayment(token: string) {
  const registrations = loadRegistrations();
  const registration = registrations.find((item) => item.token === token);
  if (!registration) return undefined;

  return updateRegistration(registration.id, {
    paymentStatus: "PAID",
    status: "CONFIRMED",
    confirmedAt: nowIso(),
    registrationNumber: registration.registrationNumber ?? randomCode("INS"),
  });
}

export function exportRegistrationsCsv(registrations: Registration[]) {
  const headers = [
    "numero",
    "nome",
    "matricula",
    "serie",
    "turma",
    "comite",
    "responsavel",
    "email",
    "telefone",
    "status_inscricao",
    "status_pagamento",
    "valor",
    "data_inscricao",
    "data_confirmacao",
  ];

  const rows = registrations.map((registration) => [
    registration.registrationNumber ?? registration.publicId,
    registration.studentName,
    registration.studentRegistrationNumber,
    registration.grade,
    registration.classGroup,
    registration.committeeId,
    registration.guardianName,
    registration.guardianEmail,
    registration.guardianPhone,
    registration.status,
    registration.paymentStatus,
    registration.amount.toFixed(2),
    registration.createdAt,
    registration.confirmedAt ?? "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
