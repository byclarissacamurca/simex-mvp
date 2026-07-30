export const eventConfig = {
  name: "SIMEX",
  longName: "SIMEX - Simulação ONU do Colégio Dom Bosco",
  edition: "2026",
  subtitle:
    "Uma experiência diplomática para estudantes que querem argumentar, negociar e compreender desafios globais.",
  date: "24 e 25 de setembro",
  location: "Colégio Dom Bosco",
  targetAudience: "9º ano ao 3º ano do Ensino Médio",
  registrationDeadline: "12 de setembro de 2026",
  registrationFee: 89,
  currency: "BRL",
  contactEmail: "simex.onu@dombosco.edu.br",
  privacyVersion: "privacidade-2026-01",
  termsVersion: "termos-2026-01",
};

export const aboutBlocks = [
  "O SIMEX aproxima estudantes do funcionamento das Nações Unidas por meio de debates, pesquisa, construção de consenso e defesa de posições em comitês temáticos.",
  "A proposta pedagógica desenvolve comunicação, escrita, repertório sociopolítico, escuta ativa, liderança e tomada de decisão em situações complexas.",
  "Nesta versão do MVP, a plataforma organiza as informações do evento, recebe inscrições, reserva vagas, simula checkout hospedado e permite acompanhamento administrativo.",
];

export const schedule = [
  { date: "05 ago", title: "Abertura das inscrições", detail: "Formulário liberado para alunos e responsáveis." },
  { date: "12 set", title: "Encerramento das inscrições", detail: "Último dia para concluir inscrição e pagamento." },
  { date: "16 a 23 set", title: "Preparação", detail: "Guias de estudo, reuniões e orientação dos delegados." },
  { date: "24 set", title: "Credenciamento e abertura", detail: "Recepção, fala institucional e primeira sessão." },
  { date: "25 set", title: "Sessões e encerramento", detail: "Debates finais, resoluções e cerimônia de encerramento." },
];

export const faq = [
  {
    question: "Quem pode participar?",
    answer: "Estudantes do 9º ano ao 3º ano do Ensino Médio, conforme orientação da equipe organizadora.",
  },
  {
    question: "Qual é o valor da inscrição?",
    answer: "O valor configurado para este MVP é R$ 89,00. O valor final deve ser validado pela instituição.",
  },
  {
    question: "Como escolho um comitê?",
    answer: "Você pode escolher um comitê pela área de Comitês ou pelo próprio formulário de inscrição.",
  },
  {
    question: "Como receberei a confirmação?",
    answer: "A confirmação deve ser enviada por e-mail após o webhook do gateway confirmar o pagamento.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer: "A arquitetura prevê checkout hospedado com Pix e cartão. No MVP local, o checkout é simulado.",
  },
  {
    question: "O que acontece se o pagamento não for concluído?",
    answer: "A inscrição permanece pendente até a expiração da reserva. Depois disso, um novo checkout pode ser gerado se houver vagas.",
  },
];
