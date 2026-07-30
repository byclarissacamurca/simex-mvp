import { z } from "zod";

export const registrationSchema = z.object({
  studentName: z.string().trim().min(5, "Informe o nome completo do estudante."),
  birthDate: z.string().min(1, "Informe a data de nascimento."),
  studentRegistrationNumber: z.string().trim().min(4, "Informe uma matrícula válida."),
  grade: z.string().min(1, "Selecione a série."),
  classGroup: z.string().trim().min(1, "Informe a turma."),
  schoolUnit: z.string().trim().min(2, "Informe a unidade escolar."),
  studentEmail: z.string().email("Informe um e-mail institucional válido."),
  studentPhone: z.string().optional(),
  guardianName: z.string().trim().min(5, "Informe o nome completo do responsável."),
  guardianEmail: z.string().email("Informe um e-mail válido do responsável."),
  guardianPhone: z.string().trim().min(8, "Informe um telefone válido."),
  guardianRelationship: z.string().trim().min(2, "Informe a relação com o estudante."),
  committeeId: z.string().min(1, "Escolha um comitê."),
  secondaryCommitteeId: z.string().optional(),
  previousExperience: z.string().optional(),
  accessibilityNotes: z.string().optional(),
});

export type RegistrationFieldErrors = Partial<Record<keyof z.infer<typeof registrationSchema>, string>>;

export function validateRegistrationForm(input: unknown) {
  const result = registrationSchema.safeParse(input);

  if (result.success) {
    return { success: true as const, data: result.data, errors: {} };
  }

  const errors: RegistrationFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegistrationFieldErrors;
    if (!errors[field]) errors[field] = issue.message;
  }

  return { success: false as const, errors };
}
