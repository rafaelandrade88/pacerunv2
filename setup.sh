#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

step() { echo -e "\n${CYAN}▸ $1${RESET}"; }
ok()   { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail() { echo -e "${RED}✗ $1${RESET}"; exit 1; }

# ─── 1. Pré-requisitos ───────────────────────────────────────────────
step "Verificando pré-requisitos"
command -v node >/dev/null 2>&1 || fail "Node.js não encontrado. Instale em https://nodejs.org (v20+)"
command -v npm  >/dev/null 2>&1 || fail "npm não encontrado"
NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
[[ "$NODE_VER" -lt 20 ]] && fail "Node.js v20+ necessário (atual: $(node --version))"
ok "Node.js $(node --version)"

# ─── 2. Instala dependências ─────────────────────────────────────────
step "Instalando dependências npm"
npm install || fail "npm install falhou"
ok "Dependências instaladas"

# ─── 3. Radix UI peer deps para Shadcn ─────────────────────────────
step "Instalando peer deps Radix/Shadcn"
npm install @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-alert-dialog @radix-ui/react-switch \
  @radix-ui/react-label || warn "Algumas peer deps falharam — shadcn@latest add vai resolver"
ok "Peer deps instalados"

# ─── 4. Shadcn init + componentes ───────────────────────────────────
step "Inicializando Shadcn UI"
echo -e "${YELLOW}Executando shadcn init (responda as perguntas como abaixo):\n  Style: Default\n  Base color: Neutral\n  CSS variables: Yes${RESET}"
npx shadcn@latest init --yes 2>/dev/null || true

step "Instalando componentes Shadcn UI"
npx shadcn@latest add --yes \
  button input form label avatar dropdown-menu skeleton \
  select textarea alert-dialog switch badge separator card \
  || warn "Alguns componentes podem ter falhado — verifique src/components/ui/"
ok "Componentes Shadcn instalados"

# ─── 5. Firebase CLI ─────────────────────────────────────────────────
step "Verificando Firebase CLI"
if ! command -v firebase >/dev/null 2>&1; then
  warn "Firebase CLI não encontrado — instalando globalmente"
  npm install -g firebase-tools || fail "Falha ao instalar firebase-tools"
fi
ok "Firebase CLI: $(firebase --version)"

# ─── 6. Configura variáveis de ambiente ─────────────────────────────
step "Configurando .env.local"
if [[ ! -f ".env.local" ]]; then
  cp .env.example .env.local
  echo -e "${YELLOW}Arquivo .env.local criado a partir de .env.example${RESET}"
  echo -e "${YELLOW}ATENÇÃO: Preencha as variáveis do Firebase em .env.local antes de continuar${RESET}"
  echo ""
  echo -e "  Firebase Console: https://console.firebase.google.com"
  echo -e "  Projeto: Configurações > Configurações do Projeto > SDK setup"
  echo ""
  read -p "Pressione ENTER após preencher o .env.local..."
else
  ok ".env.local já existe"
fi

# ─── 7. Valida env ──────────────────────────────────────────────────
step "Validando variáveis de ambiente"
REQUIRED_VARS=(
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  NEXT_PUBLIC_APP_URL
)
ENV_OK=true
for var in "${REQUIRED_VARS[@]}"; do
  val=$(grep -E "^${var}=" .env.local 2>/dev/null | cut -d'=' -f2 || echo "")
  if [[ -z "$val" ]]; then
    warn "Variável não preenchida: $var"
    ENV_OK=false
  fi
done
$ENV_OK && ok "Todas as variáveis obrigatórias estão preenchidas" || warn "Algumas variáveis não preenchidas — o build pode falhar"

# ─── 8. Firebase login + deploy rules ───────────────────────────────
step "Login Firebase"
firebase login --no-localhost 2>/dev/null || firebase login || warn "Login Firebase pulado"

step "Deploy Firestore Rules e Indexes"
firebase deploy --only firestore:rules,firestore:indexes,storage \
  --project "$(cat .firebaserc | python3 -c "import sys,json; print(json.load(sys.stdin)['projects']['default'])")" \
  || warn "Deploy Firebase falhou — pode ser que o projeto não esteja configurado"
ok "Firebase rules deployadas"

# ─── 9. Build de teste ──────────────────────────────────────────────
step "Executando build de validação"
npm run build && ok "Build concluído com sucesso!" || warn "Build falhou — verifique os erros acima"

# ─── 10. Git init ────────────────────────────────────────────────────
step "Inicializando repositório Git"
if [[ ! -d ".git" ]]; then
  git init
  git add -A
  git commit -m "feat: initial PaceRun v2.0 setup"
  ok "Repositório Git inicializado"
  echo ""
  echo -e "${CYAN}Próximo passo — conecte ao GitHub:${RESET}"
  echo -e "  git remote add origin git@github.com:rafaelandrade88/pacerunv2.git"
  echo -e "  git push -u origin main"
else
  ok "Repositório Git já existe"
fi

# ─── 11. Vercel (opcional) ───────────────────────────────────────────
step "Deploy Vercel (opcional)"
if command -v vercel >/dev/null 2>&1; then
  echo -e "${YELLOW}Iniciando deploy no Vercel...${RESET}"
  vercel --yes || warn "Deploy Vercel falhou ou foi cancelado"
else
  warn "Vercel CLI não encontrado. Para deployar:"
  echo -e "  npm install -g vercel"
  echo -e "  vercel --yes"
fi

# ─── Resumo final ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  PaceRun v2.0 — Setup concluído!                             ${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${CYAN}Iniciar desenvolvimento:${RESET}  npm run dev"
echo -e "  ${CYAN}Build produção:${RESET}           npm run build"
echo -e "  ${CYAN}Validação completa:${RESET}       npm run validate"
echo -e "  ${CYAN}Emuladores Firebase:${RESET}      firebase emulators:start"
echo ""
echo -e "  ${YELLOW}Secrets GitHub Actions necessários:${RESET}"
echo -e "    NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo -e "    NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo -e "    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID"
echo -e "    FIREBASE_TOKEN  (via: firebase login:ci)"
echo -e "    VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID  (via: vercel env)"
echo ""
