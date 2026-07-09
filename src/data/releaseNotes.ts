export interface ReleaseEntry {
  version: string
  date: string
  title: string
  features: string[]
}

export const RELEASE_NOTES: ReleaseEntry[] = [
  {
    version: '2.0.0',
    date: '08/07/2026',
    title: 'PaceRun v2 — Lançamento oficial',
    features: [
      'Novo design visual com tema escuro e cor verde PaceRun',
      'Rastreamento de corrida com GPS em tempo real',
      'Dashboard com estatísticas semanais e gráfico de volume',
      'Histórico completo de atividades com filtros por tipo e período',
      'Perfil personalizado com foto e bio',
      'Login com Google ou e-mail/senha',
      'Recuperação de senha por e-mail',
      'Menu lateral hambúrguer para navegação em dispositivos móveis',
      'Suporte a PWA — instale o app direto no seu celular',
    ],
  },
]

export const CURRENT_VERSION = '2.0.0'
