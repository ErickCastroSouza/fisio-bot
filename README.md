# FisioBot 💜

Sistema de atendimento automatizado para clínicas de fisioterapia.

O FisioBot é um projeto desenvolvido como parte do Projeto de Extensão (PEX) do curso de Análise e Desenvolvimento de Sistemas, com o objetivo de auxiliar profissionais de fisioterapia no gerenciamento do atendimento aos pacientes.

A proposta é centralizar conversas, informações de pacientes, agendamentos e respostas automáticas em uma única aplicação, reduzindo o trabalho com mensagens repetitivas e facilitando a organização do atendimento.

---

## 📋 Sobre o projeto

Profissionais de fisioterapia podem receber uma grande quantidade de mensagens diariamente com dúvidas sobre valores, horários, localização, tipos de atendimento e agendamentos.

O FisioBot busca solucionar esse problema por meio de um sistema de atendimento automatizado, permitindo que o paciente interaja com um bot para obter informações básicas e iniciar processos como o agendamento de uma avaliação.

Quando necessário, a conversa pode ser encaminhada para atendimento humano.

> **Importante:** o FisioBot possui finalidade administrativa e de atendimento. O sistema não realiza diagnóstico, prescrição de exercícios ou recomendações de tratamento.

---

## ✨ Funcionalidades

### 🤖 Atendimento automatizado

- Mensagem inicial personalizada.
- Menu de opções configurável.
- Respostas automáticas para dúvidas frequentes.
- Fluxo de atendimento para agendamento.
- Possibilidade de encaminhamento para atendimento humano.
- Histórico das mensagens da conversa.

### 💬 Gerenciamento de conversas

- Visualização das conversas.
- Identificação do status da conversa:
  - Atendimento automático
  - Atendimento humano
  - Encerrada
- Visualização das mensagens trocadas.
- Simulação de mensagens enviadas pelo paciente para testes do bot.

### 📅 Agenda

- Visualização dos agendamentos.
- Navegação entre os dias.
- Cadastro de novos horários.
- Identificação dos pacientes relacionados aos agendamentos.
- Integração dos agendamentos com o restante do sistema.

### 👤 Pacientes

- Cadastro de pacientes.
- Visualização dos pacientes cadastrados.
- Informações básicas de contato.
- Associação dos pacientes às conversas e agendamentos.

### ⚙️ Configurações

- Personalização da mensagem inicial.
- Configuração das opções apresentadas pelo bot.
- Ativação ou desativação de opções.
- Configuração do encaminhamento para atendimento humano.
- Gerenciamento das perguntas frequentes (FAQ).

### 📊 Dashboard

- Visão geral do atendimento.
- Indicadores do sistema.
- Próximos agendamentos.
- Conversas recentes.
- Conversas aguardando atendimento humano.

---

## 🛠️ Tecnologias utilizadas

### Front-end

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

### Back-end

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Fastify](https://fastify.dev/)

### Banco de dados

- [Supabase](https://supabase.com/)
- PostgreSQL

### Ferramentas

- Git
- GitHub
- Vercel

---

## 🏗️ Estrutura do projeto

O projeto utiliza uma estrutura de monorepo:

```text
fisio-bot/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── App.tsx
│       │   └── ...
│       ├── package.json
│       └── ...
│
├── packages/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md