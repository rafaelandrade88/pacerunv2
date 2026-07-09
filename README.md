# PaceRun v2.0

PWA de rastreamento de corridas com Next.js 14, Firebase, TypeScript e Tailwind.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn/UI, Framer Motion
- **GPS:** Leaflet + OpenStreetMap
- **Charts:** Recharts
- **State:** Zustand (corrida ativa) + TanStack Query (dados remotos)
- **Backend:** Firebase Auth, Firestore, Storage
- **Deploy:** Vercel (frontend) + Firebase (regras)
- **PWA:** next-pwa

## Setup rápido

```bash
# 1. Clone o repo
git clone git@github.com:rafaelandrade88/pacerunv2.git
cd pacerunv2

# 2. Execute o setup automatizado
chmod +x setup.sh
./setup.sh
```

O script:
- Instala dependências
- Inicializa Shadcn UI e instala componentes
- Cria `.env.local`
- Deploya Firebase Rules/Indexes
- Faz build de validação
- Inicializa Git e opcionalmente deploya no Vercel

## Variáveis de Ambiente

```bash
cp .env.example .env.local
# Preencha com as credenciais do seu projeto Firebase
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run validate` | TypeCheck + Lint + Format |
| `firebase emulators:start` | Emuladores locais |

## Arquitetura

```
src/
├── app/                  # Next.js App Router (rotas/pages)
│   ├── (auth)/           # Grupo de rotas públicas
│   └── (dashboard)/      # Grupo de rotas protegidas
├── domain/               # Entities, Value Objects, Repository Interfaces
├── infrastructure/       # Firebase (Firestore, Auth, Storage)
├── features/             # Módulos de feature
│   ├── auth/             # Autenticação
│   ├── dashboard/        # Dashboard
│   ├── run/              # GPS + tracking + summary
│   ├── history/          # Histórico + filtros
│   ├── profile/          # Perfil + upload
│   └── navigation/       # Nav (Sidebar + BottomNav)
├── providers/            # Context providers
└── shared/               # Componentes e hooks compartilhados
```

## GitHub Actions Secrets

| Secret | Como obter |
|--------|-----------|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console > Configurações do Projeto |
| `FIREBASE_TOKEN` | `firebase login:ci` |
| `VERCEL_TOKEN` | Vercel Dashboard > Settings > Tokens |
| `VERCEL_ORG_ID` | `vercel env ls` |
| `VERCEL_PROJECT_ID` | `vercel env ls` |
