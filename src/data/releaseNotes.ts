export interface ReleaseEntry {
  version: string
  date: string
  title: string
  features: string[]
}

export const RELEASE_NOTES: ReleaseEntry[] = [
  {
    version: '2.1.0',
    date: '10/07/2026',
    title: 'Motivação e qualidade de corrida',
    features: [
      'Contagem regressiva 3-2-1 ao iniciar a corrida',
      'Pausa automática quando você para (semáforo, descanso) e retomada ao voltar a se mover',
      'Meta semanal de km com anel de progresso no dashboard',
      'Recordes pessoais no perfil: 1km, 5km e 10km mais rápidos, maior distância e corrida mais longa',
      'Celebração quando você quebra um recorde ao salvar a corrida',
      'Sequência de semanas correndo no dashboard',
      'Compartilhe sua corrida como imagem no Instagram, WhatsApp e Facebook',
      'Tela permanece ligada durante a corrida',
      'Botões maiores para uso em movimento e suporte a redução de animações do sistema',
    ],
  },
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

export const CURRENT_VERSION = '2.1.0'
