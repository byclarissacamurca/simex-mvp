import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  ChevronDown,
  Download,
  ExternalLink,
  Filter,
  Landmark,
  LockKeyhole,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { aboutBlocks, eventConfig, faq, schedule } from "./content/event";
import {
  availableSeats,
  createRegistration,
  exportRegistrationsCsv,
  getCommitteesWithLiveSeats,
  loadRegistrations,
  simulatePayment,
} from "./lib/storage";
import { validateRegistrationForm, type RegistrationFieldErrors } from "./lib/validation";
import type { Committee, Registration, RegistrationFormData, RegistrationStatus } from "./types/domain";

const initialForm: RegistrationFormData = {
  studentName: "",
  birthDate: "",
  studentRegistrationNumber: "",
  grade: "",
  classGroup: "",
  schoolUnit: "Colégio Dom Bosco",
  studentEmail: "",
  studentPhone: "",
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  guardianRelationship: "",
  committeeId: "",
  secondaryCommitteeId: "",
  previousExperience: "",
  accessibilityNotes: "",
};

const statusLabels: Record<RegistrationStatus, string> = {
  DRAFT: "Rascunho",
  PENDING_PAYMENT: "Pagamento pendente",
  PAYMENT_PROCESSING: "Pagamento em análise",
  CONFIRMED: "Confirmada",
  PAYMENT_FAILED: "Falha no pagamento",
  PAYMENT_EXPIRED: "Pagamento expirado",
  CANCELED: "Cancelada",
  REFUNDED: "Reembolsada",
  WAITLIST: "Lista de espera",
};

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function classNames(...items: Array<string | false | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<RegistrationFormData>(initialForm);
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [accepted, setAccepted] = useState({
    truth: false,
    terms: false,
    privacy: false,
    data: false,
    guardian: false,
  });
  const [registrations, setRegistrations] = useState<Registration[]>(() => loadRegistrations());
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [statusToken, setStatusToken] = useState("");
  const [adminQuery, setAdminQuery] = useState("");
  const [adminCommittee, setAdminCommittee] = useState("all");
  const [adminStatus, setAdminStatus] = useState("all");

  const committees = useMemo(() => getCommitteesWithLiveSeats(registrations), [registrations]);
  const selectedCommittee = committees.find((committee) => committee.id === form.committeeId);
  const locatedStatus = registrations.find(
    (registration) => registration.token.toLowerCase() === statusToken.trim().toLowerCase(),
  );

  const filteredRegistrations = registrations.filter((registration) => {
    const search = adminQuery.trim().toLowerCase();
    const matchesSearch =
      !search ||
      registration.studentName.toLowerCase().includes(search) ||
      registration.studentRegistrationNumber.toLowerCase().includes(search) ||
      registration.guardianEmail.toLowerCase().includes(search);
    const matchesCommittee = adminCommittee === "all" || registration.committeeId === adminCommittee;
    const matchesStatus = adminStatus === "all" || registration.status === adminStatus;

    return matchesSearch && matchesCommittee && matchesStatus;
  });

  const confirmedCount = registrations.filter((registration) => registration.status === "CONFIRMED").length;
  const pendingCount = registrations.filter((registration) => registration.status === "PENDING_PAYMENT").length;
  const revenue = registrations
    .filter((registration) => registration.status === "CONFIRMED")
    .reduce((sum, registration) => sum + registration.amount, 0);

  function chooseCommittee(committeeId: string) {
    setForm((current) => ({ ...current, committeeId }));
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatedRegistration(null);

    const result = validateRegistrationForm(form);
    const missingConsent = Object.values(accepted).some((value) => !value);
    if (!result.success || missingConsent) {
      setErrors({
        ...(!result.success ? result.errors : {}),
        ...(missingConsent ? { guardianRelationship: "Aceite todos os termos obrigatórios antes de enviar." } : {}),
      });
      return;
    }

    const created = createRegistration(result.data);
    if (!created.ok) {
      if (created.reason === "duplicate" && created.registration) {
        setCreatedRegistration(created.registration);
        setStatusToken(created.registration.token);
        return;
      }

      setErrors({ committeeId: "Este comitê não possui vagas disponíveis no momento." });
      return;
    }

    const next = loadRegistrations();
    setRegistrations(next);
    setCreatedRegistration(created.registration);
    setStatusToken(created.registration.token);
    setErrors({});
    setForm(initialForm);
    setAccepted({ truth: false, terms: false, privacy: false, data: false, guardian: false });
  }

  function completeMockCheckout(token: string) {
    const updated = simulatePayment(token);
    if (!updated) return;
    const next = loadRegistrations();
    setRegistrations(next);
    setCreatedRegistration(updated);
    setStatusToken(token);
  }

  function downloadCsv() {
    const csv = exportRegistrationsCsv(filteredRegistrations);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simex-inscricoes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Ir para o início">
          <span className="brand-mark">S</span>
          <span>
            <strong>simexonu</strong>
            <small>Simulação Exponencial</small>
          </span>
        </a>

        <button className="icon-button menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={classNames("nav", menuOpen && "open")} aria-label="Navegação principal">
          {["Sobre", "Comitês", "Cronograma", "FAQ", "Status", "Admin"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace("ê", "e")}`} onClick={() => setMenuOpen(false)}>
              {item}
            </a>
          ))}
          <a className="nav-cta" href="#inscricao" onClick={() => setMenuOpen(false)}>
            Inscreva-se
          </a>
        </nav>
      </header>

      <main>
        <section id="inicio" className="hero section-band">
          <div className="hero-copy">
            <p className="eyebrow">Colégio Dom Bosco apresenta</p>
            <h1>{eventConfig.longName}</h1>
            <p className="hero-text">{eventConfig.subtitle}</p>
            <div className="hero-actions">
              <a className="button primary" href="#inscricao">
                Fazer inscrição <ArrowRight size={18} />
              </a>
              <a className="button secondary" href="#comites">
                Conhecer comitês
              </a>
            </div>
          </div>

          <div className="hero-panel" aria-label="Informações rápidas do evento">
            <div className="seal">
              <Landmark size={56} />
              <span>ONU</span>
            </div>
            <InfoTile icon={<CalendarDays size={18} />} label="Data" value={eventConfig.date} />
            <InfoTile icon={<Landmark size={18} />} label="Local" value={eventConfig.location} />
            <InfoTile icon={<Users size={18} />} label="Público" value={eventConfig.targetAudience} />
            <InfoTile icon={<Banknote size={18} />} label="Inscrição" value={money(eventConfig.registrationFee)} />
          </div>
        </section>

        <section id="sobre" className="content-section about-grid">
          <div>
            <p className="eyebrow">Sobre</p>
            <h2>Diplomacia, repertório e negociação em uma experiência prática.</h2>
          </div>
          <div className="text-stack">
            {aboutBlocks.map((block) => (
              <p key={block}>{block}</p>
            ))}
          </div>
        </section>

        <section id="comites" className="content-section">
          <SectionHeading
            eyebrow="Comitês"
            title="Escolha uma arena de debate"
            text="Os cards abaixo já consideram reservas temporárias e inscrições confirmadas registradas neste MVP."
          />
          <div className="committee-grid">
            {committees.map((committee) => (
              <CommitteeCard key={committee.id} committee={committee} onChoose={() => chooseCommittee(committee.id)} />
            ))}
          </div>
        </section>

        <section id="cronograma" className="content-section split-section">
          <SectionHeading
            eyebrow="Cronograma"
            title="Da inscrição à sessão final"
            text={`Prazo de inscrição: ${eventConfig.registrationDeadline}. Datas finais devem ser confirmadas pela equipe organizadora.`}
          />
          <div className="timeline">
            {schedule.map((item) => (
              <article key={item.title} className="timeline-item">
                <time>{item.date}</time>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="inscricao" className="content-section registration-section">
          <SectionHeading
            eyebrow="Inscrição"
            title="Reserve a vaga e siga para o checkout hospedado"
            text="Nesta versão local, o pagamento é simulado. Em produção, o botão redireciona para Asaas e a confirmação acontece apenas por webhook."
          />

          <form className="registration-form" onSubmit={submitRegistration} noValidate>
            <fieldset>
              <legend>Dados do participante</legend>
              <FormInput label="Nome completo" value={form.studentName} error={errors.studentName} onChange={(studentName) => setForm({ ...form, studentName })} />
              <div className="form-row">
                <FormInput type="date" label="Data de nascimento" value={form.birthDate} error={errors.birthDate} onChange={(birthDate) => setForm({ ...form, birthDate })} />
                <FormInput label="Matrícula" value={form.studentRegistrationNumber} error={errors.studentRegistrationNumber} onChange={(studentRegistrationNumber) => setForm({ ...form, studentRegistrationNumber })} />
              </div>
              <div className="form-row">
                <FormSelect label="Série" value={form.grade} error={errors.grade} onChange={(grade) => setForm({ ...form, grade })} options={["9º ano", "1º ano EM", "2º ano EM", "3º ano EM"]} />
                <FormInput label="Turma" value={form.classGroup} error={errors.classGroup} onChange={(classGroup) => setForm({ ...form, classGroup })} />
              </div>
              <FormInput label="Unidade escolar" value={form.schoolUnit} error={errors.schoolUnit} onChange={(schoolUnit) => setForm({ ...form, schoolUnit })} />
              <div className="form-row">
                <FormInput type="email" label="E-mail institucional" value={form.studentEmail} error={errors.studentEmail} onChange={(studentEmail) => setForm({ ...form, studentEmail })} />
                <FormInput label="Telefone do aluno (opcional)" value={form.studentPhone ?? ""} onChange={(studentPhone) => setForm({ ...form, studentPhone })} />
              </div>
            </fieldset>

            <fieldset>
              <legend>Comitês</legend>
              <FormSelect
                label="Comitê escolhido"
                value={form.committeeId}
                error={errors.committeeId}
                onChange={(committeeId) => setForm({ ...form, committeeId })}
                options={committees.filter((committee) => availableSeats(committee) > 0).map((committee) => `${committee.id}|${committee.acronym} - ${committee.name}`)}
                valueParser={(option) => option.split("|")[0]}
                labelParser={(option) => option.split("|")[1]}
              />
              <FormSelect
                label="Segunda opção (opcional)"
                value={form.secondaryCommitteeId ?? ""}
                onChange={(secondaryCommitteeId) => setForm({ ...form, secondaryCommitteeId })}
                options={["", ...committees.map((committee) => `${committee.id}|${committee.acronym} - ${committee.name}`)]}
                valueParser={(option) => option.split("|")[0] ?? ""}
                labelParser={(option) => (option ? option.split("|")[1] : "Sem segunda opção")}
              />
              {selectedCommittee && (
                <p className="form-hint">
                  {selectedCommittee.acronym}: {availableSeats(selectedCommittee)} vagas disponíveis agora.
                </p>
              )}
              <FormTextarea label="Experiência anterior em simulações (opcional)" value={form.previousExperience ?? ""} onChange={(previousExperience) => setForm({ ...form, previousExperience })} />
              <FormTextarea label="Necessidade específica de acessibilidade (opcional)" value={form.accessibilityNotes ?? ""} onChange={(accessibilityNotes) => setForm({ ...form, accessibilityNotes })} />
            </fieldset>

            <fieldset>
              <legend>Dados do responsável</legend>
              <FormInput label="Nome completo do responsável" value={form.guardianName} error={errors.guardianName} onChange={(guardianName) => setForm({ ...form, guardianName })} />
              <div className="form-row">
                <FormInput type="email" label="E-mail do responsável" value={form.guardianEmail} error={errors.guardianEmail} onChange={(guardianEmail) => setForm({ ...form, guardianEmail })} />
                <FormInput label="Telefone do responsável" value={form.guardianPhone} error={errors.guardianPhone} onChange={(guardianPhone) => setForm({ ...form, guardianPhone })} />
              </div>
              <FormInput label="Relação com o estudante" value={form.guardianRelationship} error={errors.guardianRelationship} onChange={(guardianRelationship) => setForm({ ...form, guardianRelationship })} />
            </fieldset>

            <fieldset className="consent-box">
              <legend>Autorizações</legend>
              {[
                ["truth", "Declaro que os dados fornecidos são verdadeiros."],
                ["terms", "Li e aceito os termos de participação."],
                ["privacy", "Li o aviso de privacidade."],
                ["data", "Autorizo o tratamento dos dados para organização do evento."],
                ["guardian", "Confirmo que sou responsável legal pelo estudante, quando aplicável."],
              ].map(([key, label]) => (
                <label key={key} className="check-line">
                  <input
                    type="checkbox"
                    checked={accepted[key as keyof typeof accepted]}
                    onChange={(event) => setAccepted({ ...accepted, [key]: event.target.checked })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>

            <button className="button primary submit-button" type="submit">
              Criar inscrição e checkout <ExternalLink size={18} />
            </button>
          </form>

          {createdRegistration && (
            <PaymentResult registration={createdRegistration} onPay={() => completeMockCheckout(createdRegistration.token)} />
          )}
        </section>

        <section id="status" className="content-section status-section">
          <SectionHeading
            eyebrow="Acompanhamento"
            title="Consulte a inscrição por token público"
            text="A consulta exibe apenas dados não sensíveis. O token é gerado após a inscrição."
          />
          <div className="status-lookup">
            <label>
              Token
              <input value={statusToken} onChange={(event) => setStatusToken(event.target.value)} placeholder="TOK-..." />
            </label>
            {locatedStatus ? (
              <article className="status-card">
                <BadgeCheck size={24} />
                <div>
                  <strong>{locatedStatus.registrationNumber ?? locatedStatus.publicId}</strong>
                  <p>
                    {locatedStatus.studentName} - {committeeName(committees, locatedStatus.committeeId)}
                  </p>
                  <span className={`status-pill ${locatedStatus.status.toLowerCase()}`}>
                    {statusLabels[locatedStatus.status]}
                  </span>
                  {locatedStatus.status === "PENDING_PAYMENT" && (
                    <button className="button secondary" type="button" onClick={() => completeMockCheckout(locatedStatus.token)}>
                      Continuar pagamento
                    </button>
                  )}
                </div>
              </article>
            ) : (
              <p className="empty-state">Digite um token válido para consultar a inscrição.</p>
            )}
          </div>
        </section>

        <section id="faq" className="content-section faq-section">
          <SectionHeading eyebrow="FAQ" title="Perguntas frequentes" text="Respostas rápidas para participantes e responsáveis." />
          <div className="faq-list">
            {faq.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <ChevronDown size={18} />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="admin" className="content-section admin-section">
          <SectionHeading
            eyebrow="Admin"
            title="Painel de acompanhamento"
            text="MVP local para consulta, filtros e exportação. Em produção, esta rota deve ser protegida por autenticação Supabase."
          />
          <div className="security-note">
            <LockKeyhole size={20} />
            <span>Dados administrativos exigem autenticação obrigatória antes da publicação.</span>
          </div>

          <div className="metrics-grid">
            <Metric label="Inscrições" value={registrations.length.toString()} />
            <Metric label="Pendentes" value={pendingCount.toString()} />
            <Metric label="Confirmadas" value={confirmedCount.toString()} />
            <Metric label="Arrecadado" value={money(revenue)} />
          </div>

          <div className="admin-toolbar">
            <label>
              <Search size={16} />
              <input value={adminQuery} onChange={(event) => setAdminQuery(event.target.value)} placeholder="Nome, matrícula ou e-mail" />
            </label>
            <label>
              <Filter size={16} />
              <select value={adminCommittee} onChange={(event) => setAdminCommittee(event.target.value)}>
                <option value="all">Todos os comitês</option>
                {committees.map((committee) => (
                  <option key={committee.id} value={committee.id}>
                    {committee.acronym}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <ShieldCheck size={16} />
              <select value={adminStatus} onChange={(event) => setAdminStatus(event.target.value)}>
                <option value="all">Todos os status</option>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary" type="button" onClick={downloadCsv}>
              <Download size={17} /> Exportar CSV
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Estudante</th>
                  <th>Matrícula</th>
                  <th>Comitê</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.registrationNumber ?? registration.publicId}</td>
                    <td>
                      <strong>{registration.studentName}</strong>
                      <small>
                        {registration.grade} - {registration.classGroup}
                      </small>
                    </td>
                    <td>{registration.studentRegistrationNumber}</td>
                    <td>{committeeName(committees, registration.committeeId)}</td>
                    <td>
                      <span className={`status-pill ${registration.status.toLowerCase()}`}>
                        {statusLabels[registration.status]}
                      </span>
                    </td>
                    <td>{registration.paymentStatus}</td>
                    <td>{money(registration.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRegistrations.length === 0 && <p className="empty-state">Nenhuma inscrição encontrada.</p>}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>{eventConfig.longName}</strong>
          <p>Colégio Dom Bosco - plataforma de inscrição, pagamento e acompanhamento.</p>
        </div>
        <a href={`mailto:${eventConfig.contactEmail}`}>
          <Mail size={17} /> {eventConfig.contactEmail}
        </a>
      </footer>
    </>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="info-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function CommitteeCard({ committee, onChoose }: { committee: Committee; onChoose: () => void }) {
  const seats = availableSeats(committee);
  return (
    <article className={`committee-card accent-${committee.accent}`}>
      <div className="committee-topline">
        <span>{committee.acronym}</span>
        <small>{committee.language}</small>
      </div>
      <h3>{committee.name}</h3>
      <p className="committee-topic">Tema: {committee.topic}</p>
      <p>{committee.description}</p>
      <div className="seat-row">
        <span>{seats} vagas disponíveis</span>
        <strong>{committee.confirmedSeats + committee.reservedSeats}/{committee.capacity}</strong>
      </div>
      <button className="button dark" type="button" onClick={onChoose} disabled={seats <= 0}>
        {seats > 0 ? "Escolher este comitê" : "Vagas esgotadas"}
      </button>
    </article>
  );
}

function FormInput({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className={classNames("field", error && "has-error")} htmlFor={id}>
      {label}
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />
      {error && <span>{error}</span>}
    </label>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className="field" htmlFor={id}>
      {label}
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  valueParser = (option: string) => option,
  labelParser = (option: string) => option,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  valueParser?: (option: string) => string;
  labelParser?: (option: string) => string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <label className={classNames("field", error && "has-error")} htmlFor={id}>
      {label}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={`${label}-${option || "empty"}`} value={valueParser(option)}>
            {labelParser(option)}
          </option>
        ))}
      </select>
      {error && <span>{error}</span>}
    </label>
  );
}

function PaymentResult({ registration, onPay }: { registration: Registration; onPay: () => void }) {
  return (
    <article className="payment-result">
      <Sparkles size={24} />
      <div>
        <h3>{registration.status === "CONFIRMED" ? "Inscrição confirmada" : "Inscrição criada"}</h3>
        <p>
          Token público: <strong>{registration.token}</strong>
        </p>
        <p>
          Número: <strong>{registration.registrationNumber ?? registration.publicId}</strong>
        </p>
        {registration.status === "PENDING_PAYMENT" ? (
          <button className="button primary" type="button" onClick={onPay}>
            Abrir checkout simulado <ExternalLink size={18} />
          </button>
        ) : (
          <p className="confirmation-copy">
            Pagamento aprovado no simulador. Em produção, essa mudança viria apenas do webhook autenticado do gateway.
          </p>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function committeeName(committees: Committee[], committeeId: string) {
  const committee = committees.find((item) => item.id === committeeId);
  return committee ? committee.acronym : committeeId;
}
