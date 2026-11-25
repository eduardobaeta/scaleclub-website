import stage0 from '@/assets/images/double-diamond/stage-0.png';
import stage1 from '@/assets/images/double-diamond/stage-1.png';
import stage2 from '@/assets/images/double-diamond/stage-2.png';
import stage3 from '@/assets/images/double-diamond/stage-3.png';
import stage4 from '@/assets/images/double-diamond/stage-4.png';
import lesson from '@/assets/images/double-diamond-lesson.jpg';
import type { SiteNavigation } from '../site';
import { routes, sectionLink } from '../routes';

export type PrincipleIcon = 'people' | 'visual' | 'collaboration' | 'iteration';

const doubleDiamondSections = {
  lesson: 'aula',
  phases: 'fases',
  designThinking: 'design-thinking',
  ebook: 'ebook',
} as const;

const ebookLink = `/double-diamond/#${doubleDiamondSections.ebook}`;

export const doubleDiamondNavigation: SiteNavigation = {
  items: [
    { href: `/double-diamond/#${doubleDiamondSections.lesson}`, label: 'Aula' },
    { href: `/double-diamond/#${doubleDiamondSections.phases}`, label: 'As 4 fases' },
    { href: ebookLink, label: 'Ebook' },
    { href: routes.table, label: 'A Mesa' },
    { href: routes.home, label: 'Mentoria' },
  ],
  callToAction: { href: ebookLink, label: 'Baixar ebook' },
};

export const doubleDiamondPage = {
  title: 'Double Diamond: aula gratuita + ebook | Momentum Scale Club',
  description: 'Assista à aula gratuita sobre o método Double Diamond e baixe o ebook para aplicar na sua empresa.',
};

export const lessonContent = {
  id: doubleDiamondSections.lesson,
  eyebrow: 'Aula gratuita + ebook do método Double Diamond',
  title: 'Resolva o problema certo antes de correr atrás da solução',
  lead: 'Assista à aula e entenda como o Double Diamond separa diagnóstico de solução — o mesmo raciocínio que usamos em A Mesa para transformar problemas recorrentes em decisões executadas.',
  action: { href: ebookLink, label: 'Quero o ebook gratuito' },
  video: {
    id: 'vHRCi6APO_w',
    title: 'Aula gratuita: o método Double Diamond',
    poster: lesson,
    playLabel: 'Assistir à aula',
  },
  afterVideo: 'Depois da aula, baixe o ebook com o passo a passo para aplicar na sua empresa.',
  afterVideoAction: { href: ebookLink, label: 'Quero o ebook' },
};

export const phasesContent = {
  id: doubleDiamondSections.phases,
  eyebrow: 'Dois diamantes: primeiro o problema, depois a solução',
  title: 'As quatro fases do Double Diamond',
  lead: 'O primeiro diamante abre e fecha o problema. O segundo abre e fecha a solução. Pular etapas é o que faz o mesmo problema voltar.',
  diagram: {
    unlit: stage0,
    stages: [stage1, stage2, stage3, stage4],
    phases: [
      { name: 'Descobrir', mode: 'Divergir' },
      { name: 'Definir', mode: 'Convergir' },
      { name: 'Desenvolver', mode: 'Divergir' },
      { name: 'Entregar', mode: 'Convergir' },
    ],
  },
  phases: [
    {
      name: 'Descobrir',
      description: 'Investigue antes de opinar: dados, conversas com a equipe e os sintomas que se repetem.',
      method: 'Design thinking: Empatizar',
      tools: 'Entrevistas, observação, análise de dados e pesquisa de mercado.',
    },
    {
      name: 'Definir',
      description: 'Feche o diagnóstico em uma frase: qual é o problema real e por que ele importa agora.',
      method: 'Design thinking: Definir',
      tools: 'Mapa de afinidades, persona, jornada e a pergunta “Como poderíamos…?”.',
    },
    {
      name: 'Desenvolver',
      description: 'Abra alternativas, compare caminhos e teste hipóteses pequenas antes de decidir.',
      method: 'Design thinking: Idear e prototipar',
      tools: 'Brainstorming, cocriação, esboços e protótipos rápidos.',
    },
    {
      name: 'Entregar',
      description: 'Escolha uma solução e execute com responsável, prazo e evidência do que mudou.',
      method: 'Design thinking: Testar',
      tools: 'Testes com usuários, piloto, MVP e métricas de resultado.',
    },
  ],
};

export const designThinkingContent = {
  id: doubleDiamondSections.designThinking,
  eyebrow: 'Design thinking na prática',
  title: 'O jeito de pensar que sustenta o método',
  lead: 'Design thinking é uma forma de resolver problemas colocando as pessoas no centro. O Double Diamond é o mapa que organiza esse pensamento em etapas claras, do problema à solução.',
  facts: [
    {
      value: '2004',
      description:
        'Ano em que o Design Council, órgão de design do Reino Unido, criou o Double Diamond a partir de pesquisas sobre como equipes de design trabalham.',
    },
    {
      value: '2019',
      description:
        'O modelo foi ampliado no Framework for Innovation, que somou princípios, métodos e liderança ao redor dos dois diamantes.',
    },
    {
      value: '5 etapas',
      description:
        'Do design thinking popularizado pela d.school de Stanford: empatizar, definir, idear, prototipar e testar.',
    },
  ],
  principlesTitle: 'Os 4 princípios do Design Council',
  principles: [
    {
      icon: 'people',
      title: 'Pessoas em primeiro lugar',
      description: 'Comece entendendo quem vive o problema: necessidades, rotina e o que realmente importa.',
    },
    {
      icon: 'visual',
      title: 'Comunicar de forma visual',
      description: 'Mapas, esboços e protótipos fazem todo mundo enxergar o mesmo problema.',
    },
    {
      icon: 'collaboration',
      title: 'Colaborar e cocriar',
      description: 'As melhores soluções surgem quando áreas diferentes constroem juntas.',
    },
    {
      icon: 'iteration',
      title: 'Iterar, iterar, iterar',
      description: 'Teste cedo, aprenda rápido e ajuste antes de investir pesado.',
    },
  ] satisfies { icon: PrincipleIcon; title: string; description: string }[],
  mistakesTitle: '3 erros que fazem o mesmo problema voltar',
  mistakes: [
    {
      title: 'Pular direto para a solução',
      description: 'A equipe se apaixona pela primeira ideia e resolve o sintoma, não a causa.',
    },
    {
      title: 'Pesquisar e não fechar',
      description: 'Muitos dados e nenhuma decisão: sem um problema bem definido, o segundo diamante nem começa.',
    },
    {
      title: 'Entregar sem testar',
      description: 'Sem testar com pessoas reais, o erro só aparece depois que o dinheiro já foi gasto.',
    },
  ],
};

export const ebookContent = {
  id: doubleDiamondSections.ebook,
  title: 'Baixe o ebook do Double Diamond',
  lead: 'Um guia prático com as quatro fases, perguntas para conduzir cada etapa e um modelo para aplicar no próximo problema que continua voltando para a sua mesa.',
  steps: [
    { title: 'Preencha seus dados', description: 'Nome e e-mail. O Instagram é opcional.' },
    { title: 'Acesse o ebook na hora', description: 'O download é liberado logo após o envio.' },
    {
      title: 'Aplique no próximo problema',
      description: 'Use o modelo para conduzir a próxima decisão com a sua equipe.',
    },
  ],
  form: { title: 'Receba o ebook gratuito', description: 'Preencha os campos abaixo para liberar o download.' },
};

export const tableInvitation = {
  eyebrow: 'A Mesa · mentoria individual com Alan Silva',
  title: 'Isso foi só uma fração do que acontece na Mesa',
  lead: 'Na aula você conheceu o método. Na Mesa, você aplica o Double Diamond no problema específico que trava a sua empresa, em seis encontros individuais com o Alan, dentro de um mês.',
  action: { href: sectionLink(routes.table, 'inscricao'), label: 'Agendar meu primeiro encontro' },
  note: 'Agenda limitada: 4 empresários por mês. Você agenda o primeiro encontro antes de fechar.',
  lesson: {
    title: 'Nesta aula',
    caption: 'Você conhece o método',
    items: ['O método explicado', 'Exemplos gerais', 'Você aplica sozinho'],
  },
  event: {
    title: 'Na Mesa',
    caption: 'Você resolve o seu problema',
    badge: '6 encontros',
    items: [
      'O método aplicado no seu problema real',
      'Encontros individuais, presenciais ou online',
      'Tudo dentro de um mês',
      'Orientação direta do Alan Silva',
      'Ficha de decisões e próximo passo claro',
      'Garantia nos 2 primeiros encontros',
    ],
  },
};
