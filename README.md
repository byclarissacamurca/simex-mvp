# SIMEX MVP

MVP responsivo para o site de inscrição do SIMEX - Simulação ONU do Colégio Dom Bosco.

## O que está implementado

- Landing page com hero, sobre, comitês, cronograma, FAQ e rodapé.
- Formulário de inscrição com validação, aceite de termos e bloqueio de duplicidade.
- Cálculo de vagas com reservas temporárias e inscrições confirmadas.
- Checkout hospedado em modo simulado para desenvolvimento local.
- Consulta de status por token público.
- Painel administrativo local com métricas, filtros e exportação CSV.
- Abstração `PaymentGateway` e classe inicial `AsaasPaymentGateway`.
- `.env.example` com variáveis esperadas para Supabase, Asaas, e-mail e Sheets.
- Testes de validação e normalização de status.

## Rodando localmente

```bash
npm install
npm run dev
```

## Validação

```bash
npm run test
npm run build
```

## Observações para produção

Este MVP usa `localStorage` para permitir navegação e demonstração sem credenciais. Antes de publicar em produção, mova regras críticas para o servidor, conecte PostgreSQL/Supabase, implemente route handlers, valide o webhook do Asaas, consulte o pagamento diretamente na API do gateway e proteja a área administrativa com autenticação.
