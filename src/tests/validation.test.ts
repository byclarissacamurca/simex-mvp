import { describe, expect, it } from "vitest";
import { validateRegistrationForm } from "../lib/validation";

const validForm = {
  studentName: "Maria Clara Oliveira",
  birthDate: "2010-04-10",
  studentRegistrationNumber: "20260012",
  grade: "1º ano EM",
  classGroup: "B",
  schoolUnit: "Colégio Dom Bosco",
  studentEmail: "maria@dombosco.edu.br",
  studentPhone: "",
  guardianName: "Ana Oliveira",
  guardianEmail: "ana@example.com",
  guardianPhone: "85999999999",
  guardianRelationship: "Mãe",
  committeeId: "hrc",
  secondaryCommitteeId: "csnu",
  previousExperience: "",
  accessibilityNotes: "",
};

describe("registration validation", () => {
  it("accepts a complete registration payload", () => {
    expect(validateRegistrationForm(validForm).success).toBe(true);
  });

  it("rejects invalid emails", () => {
    const result = validateRegistrationForm({ ...validForm, guardianEmail: "sem-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.guardianEmail).toBeTruthy();
    }
  });
});
