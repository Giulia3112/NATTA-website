# AIpply

Plataforma web para descoberta e gestão de oportunidades acadêmicas e profissionais — bolsas, fellowships, aceleradoras, competições e muito mais.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Wouter |
| Backend | Node.js, Express, tRPC |
| Banco de dados | PostgreSQL via Supabase + Drizzle ORM |
| Autenticação | Firebase Auth (Google + Email/Senha) |
| Deploy | Render (backend + frontend) |

## Funcionalidades

- Listagem e filtro de oportunidades por tipo, área, região, financiamento e prazo
- Dashboard Kanban para gestão de candidaturas
- Salvar oportunidades favoritas
- Perfil de usuário com bio e interesses
- Painel admin: scraper de oportunidades, gerenciamento de usuários
- Login com Google ou Email/Senha via Firebase

## Configuração local

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

Variáveis necessárias:

```env
# Supabase (PostgreSQL)
DATABASE_URL=postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres?sslmode=require

# Firebase Admin SDK (backend)
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email do admin
ADMIN_EMAIL=seu@email.com

# Firebase Client SDK (frontend)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

### 3. Criar tabelas no banco

```bash
pnpm db:push
```

### 4. Rodar em desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção (frontend + backend) |
| `pnpm start` | Inicia o servidor em produção |
| `pnpm db:push` | Sincroniza o schema com o banco |
| `pnpm db:studio` | Abre o Drizzle Studio (UI do banco) |
| `pnpm check` | Verificação de tipos TypeScript |
| `pnpm test` | Roda os testes |

## Deploy

O projeto está configurado para deploy automático no **Render** via `render.yaml`.

1. Conecte o repositório no [render.com](https://render.com)
2. Configure as variáveis de ambiente no painel do Render
3. O deploy acontece automaticamente a cada `git push`

## Estrutura do projeto

```
├── client/          # Frontend React (Vite)
│   └── src/
│       ├── pages/       # Páginas da aplicação
│       ├── components/  # Componentes reutilizáveis
│       ├── contexts/    # Contextos React (Auth, SavedOpportunities)
│       └── lib/         # Firebase, tRPC client
├── server/          # Backend Express + tRPC
│   ├── _core/       # Auth Firebase, contexto tRPC, env
│   ├── scraper/     # Scraper de oportunidades
│   ├── db.ts        # Queries do banco de dados
│   └── routers.ts   # Rotas tRPC
├── drizzle/         # Schema e migrations do banco
└── shared/          # Tipos e constantes compartilhados
```
