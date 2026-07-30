import type { Committee } from "../types/domain";

export const committees: Committee[] = [
  {
    id: "hrc",
    acronym: "HRC",
    name: "Conselho de Direitos Humanos",
    topic: "Tecnologia, juventudes e direitos fundamentais",
    description:
      "Debate sobre proteção de dados, liberdade de expressão e acesso seguro à tecnologia.",
    capacity: 32,
    reservedSeats: 4,
    confirmedSeats: 18,
    active: true,
    accent: "cyan",
  },
  {
    id: "csnu",
    acronym: "CSNU",
    name: "Conselho de Segurança",
    topic: "Crises humanitárias e segurança coletiva",
    description:
      "Negociação de resoluções em cenários de tensão internacional e mediação de conflitos.",
    language: "Português",
    capacity: 28,
    reservedSeats: 6,
    confirmedSeats: 20,
    active: true,
    accent: "green",
  },
  {
    id: "agriu",
    acronym: "AGRIU",
    name: "Assembleia Geral",
    topic: "Migrações, clima e cooperação multilateral",
    description:
      "Discussão ampla sobre deslocamentos humanos, direitos sociais e governança climática.",
    language: "Português",
    capacity: 40,
    reservedSeats: 5,
    confirmedSeats: 22,
    active: true,
    accent: "magenta",
  },
  {
    id: "cgc",
    acronym: "CGC",
    name: "Comitê de Imprensa",
    topic: "Cobertura, checagem e comunicação diplomática",
    description:
      "Produção de boletins, entrevistas e cobertura crítica das sessões do evento.",
    language: "Português",
    capacity: 18,
    reservedSeats: 2,
    confirmedSeats: 16,
    active: true,
    accent: "yellow",
  },
];
