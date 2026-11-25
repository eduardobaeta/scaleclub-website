import type { LinkItem, TitlePart } from '@/components/types';
import { routes, sectionLink } from '../routes';
import type { SiteNavigation } from '../site';

const tablePageSections = {
  howItWorks: 'como-funciona',
  audience: 'para-quem',
  pricing: 'investimento',
  faq: 'faq',
  application: 'inscricao',
  result: 'resultado',
} as const;

const applicationLink = sectionLink(routes.table, tablePageSections.application);

export const tableNavigation: SiteNavigation = {
  items: [
    { href: routes.table, label: 'Início' },
    { href: sectionLink(routes.table, tablePageSections.howItWorks), label: 'Como funciona' },
    { href: sectionLink(routes.table, tablePageSections.audience), label: 'Para quem é' },
    { href: sectionLink(routes.table, tablePageSections.pricing), label: 'Investimento' },
    { href: sectionLink(routes.table, tablePageSections.faq), label: 'FAQ' },
    { href: routes.home, label: 'Mentoria' },
  ],
  callToAction: { href: applicationLink, label: 'Agendar encontro' },
};

export const tablePage = {
  title: 'A Mesa | Mentoria individual com Alan Silva',
  description:
    'Mentoria individual para resolver um problema específico da sua empresa: seis encontros, presenciais ou online, dentro de um mês.',
};

const firstMeetingAction: LinkItem = { href: applicationLink, label: 'Agendar meu primeiro encontro' };

export const offer = {
  meetings: 6,
  period: '1 mês',
  monthlySeats: 4,
  installments: { count: '12x', value: 'R$ 399,99' },
  cashPrice: 'R$ 4.500,00',
  guarantee: 'Garantia nos 2 primeiros encontros: se não fizer sentido, devolvemos o valor.',
  firstMeetingNote: 'Você agenda o primeiro encontro antes de fechar.',
};

export const tableHero = {
  eyebrow: 'Mentoria individual com Alan Silva',
  title: [
    { text: 'Da recorrência do problema à ' },
    { text: 'execução da decisão.', highlight: true },
  ] satisfies TitlePart[],
  lead: 'Seis encontros individuais, presenciais ou online, dentro de um mês, para resolver aquele problema específico que continua travando a sua empresa.',
  action: firstMeetingAction,
  actionNote: offer.firstMeetingNote,
  stats: [
    { value: '6 encontros', label: 'Individuais: só você, o Alan e o problema que importa.' },
    { value: '1 mês', label: 'Do diagnóstico à decisão executada.' },
    { value: '4 vagas', label: 'Por mês, para cada caso ter dedicação total.' },
    { value: '2 encontros', label: 'De garantia: se não fizer sentido, devolvemos o valor.' },
  ],
};

export const recurringProblem = {
  eyebrow: 'Por que o problema volta',
  title: [{ text: 'Existem problemas que ' }, { text: 'não desaparecem.', highlight: true }] satisfies TitlePart[],
  lead: 'Eles mudam de forma e sempre voltam para a sua mesa. Quase sempre, falta uma destas três coisas:',
  items: [
    {
      title: 'Uma decisão clara',
      description: 'O assunto é discutido em várias reuniões, mas ninguém fecha o que vai ser feito.',
    },
    {
      title: 'Um responsável',
      description: 'Todo mundo participa, mas ninguém responde pelo resultado quando ele não aparece.',
    },
    {
      title: 'Um processo',
      description: 'Cada vez o problema é resolvido de um jeito diferente, e por isso ele volta.',
    },
  ],
};

export const focusedCycle = {
  eyebrow: 'Um problema por vez, com foco total',
  title: [
    { text: 'Em um mês, esse problema vira ' },
    { text: 'decisão executada.', highlight: true },
  ] satisfies TitlePart[],
  lead: 'Nada de conteúdo genérico: cada encontro trabalha o seu caso e termina com uma ação clara para a sua empresa executar.',
  items: [
    { title: 'Enxergar.', description: 'Delimitar o problema real e separar o sintoma da causa.' },
    { title: 'Decidir.', description: 'Registrar a decisão, o responsável e o prazo na ficha de decisões.' },
    { title: 'Aplicar.', description: 'Executar na empresa entre os encontros, com orientação em cada etapa.' },
    {
      title: 'Revisar.',
      description: 'Comparar o resultado com a evidência e ajustar até o problema parar de voltar.',
    },
  ],
};

export const cycleOutcome = {
  id: tablePageSections.result,
  title: 'Em seis encontros, um problema recorrente vira decisão executada.',
  lead: 'Você termina o mês com:',
  items: [
    'O problema delimitado',
    'Uma decisão registrada',
    'Um responsável definido',
    'Ações executadas',
    'Evidências do que mudou',
    'O próximo passo claro',
  ],
};

export const howItWorks = {
  id: tablePageSections.howItWorks,
  eyebrow: 'Encontros individuais, presenciais ou online. O que você traz fica entre você e o Alan.',
  title: [{ text: 'Como funciona' }] satisfies TitlePart[],
  lead: 'Seis encontros distribuídos em até um mês, com um objetivo claro em cada etapa.',
  items: [
    {
      title: 'Diagnóstico',
      description: 'Encontro 1. Delimitamos o problema, o impacto e o que precisa mudar. Você agenda antes de fechar.',
    },
    {
      title: 'Decisão',
      description: 'Encontros 2 e 3. Analisamos causas e caminhos e registramos a decisão, o responsável e o prazo.',
    },
    {
      title: 'Execução acompanhada',
      description: 'Encontros 4 e 5. A empresa executa; revisamos o que aconteceu e ajustamos a rota.',
    },
    {
      title: 'Fechamento',
      description: 'Encontro 6. Comparamos o ponto de partida com o resultado e definimos o próximo passo.',
    },
  ],
};

export const audience = {
  id: tablePageSections.audience,
  title: 'Para quem é',
  lead: 'Faz sentido se você:',
  items: [
    'É dono ou sócio, com autoridade para decidir',
    'Tem um problema específico que precisa resolver rápido',
    'Vive problemas de gestão que se repetem',
    'Ainda concentra as decisões importantes',
    'Quer resultado em semanas, não em meses',
  ],
  decisionSheet: {
    status: 'Em execução',
    title: 'Ficha de decisões',
    rows: [
      { label: 'Problema', value: 'Propostas enviadas sem acompanhamento' },
      { label: 'Decisão', value: 'Follow-up em até 48h para toda proposta', highlight: true },
      { label: 'Responsável', value: 'Coordenadora comercial' },
      { label: 'Prazo', value: 'Até o encontro 4' },
      { label: 'Evidência', value: 'Taxa de resposta das propostas' },
    ],
    progress: { label: 'Mentoria', unit: 'Encontro', current: 3, total: offer.meetings },
  },
  examplesTitle: 'Exemplos de problemas que você pode trazer',
  examples: [
    { area: 'Comercial', quote: '“Enviamos propostas, mas ninguém acompanha de forma consistente.”' },
    { area: 'Operação', quote: '“A venda acontece, mas a passagem para a entrega gera problemas.”' },
    { area: 'Gestão', quote: '“As decisões continuam chegando até mim.”' },
    { area: 'Pessoas', quote: '“Não está claro quem responde por cada entrega.”' },
    { area: 'Financeiro', quote: '“Existe cobrança, mas ninguém é claramente responsável.”' },
    { area: 'Processo', quote: '“Cada pessoa faz o trabalho de um jeito diferente.”' },
  ],
};

export const callout = {
  eyebrow: `Agenda limitada · ${offer.monthlySeats} empresários por mês`,
  kicker: 'Você não precisa resolver tudo. Precisa resolver o problema certo.',
  title: [
    { text: 'Um problema, seis encontros e um mês para ele não ' },
    { text: 'voltar.', highlight: true },
  ] satisfies TitlePart[],
  action: firstMeetingAction,
};

export const pricing = {
  id: tablePageSections.pricing,
  title: 'Investimento',
  intro: 'Seis encontros individuais em um mês, com garantia.',
  guarantee: offer.guarantee,
  installments: offer.installments,
  cashPrice: `ou ${offer.cashPrice} à vista`,
  includes: [
    'Primeiro encontro antes de fechar',
    '6 encontros individuais',
    'Presencial ou online',
    'Diagnóstico do seu problema',
    'Ficha de decisões',
    'Orientação direta do Alan Silva',
    'Ação definida em cada encontro',
    'Fechamento com próximo passo',
  ],
  seats: {
    title: 'Agenda limitada',
    count: offer.monthlySeats,
    label: `${offer.monthlySeats} empresários por mês`,
    description: `O Alan atende no máximo ${offer.monthlySeats} empresários por mês, para cada caso ter dedicação total. ${offer.firstMeetingNote}`,
    action: firstMeetingAction,
  },
};

export const application = {
  id: tablePageSections.application,
  title: 'Qual problema da sua empresa continua voltando para você?',
  lead: 'Comece pelo primeiro encontro. Entendemos o problema, o impacto e quem decide — e você só fecha se fizer sentido.',
  steps: [
    { title: 'Você envia seus dados', description: 'Leva menos de um minuto.' },
    { title: 'Agendamos o primeiro encontro', description: 'Presencial ou online, antes de você fechar.' },
    { title: 'Você decide se segue', description: 'Com o plano dos seis encontros em mãos.' },
  ],
  form: {
    title: 'Agende seu primeiro encontro',
    description: `${offer.monthlySeats} empresários por mês. Deixe seus dados e entraremos em contato.`,
  },
};

export const tableFaq = {
  id: tablePageSections.faq,
  title: 'Perguntas frequentes',
  items: [
    {
      question: 'Minha empresa é diferente. Funciona para mim?',
      answer:
        'Provavelmente sim — a mentoria é individual e parte do seu problema, não de um roteiro pronto. O primeiro encontro serve justamente para confirmar se faz sentido para você.',
    },
    {
      question: 'Já participei de outras mentorias. O que muda aqui?',
      answer:
        'São seis encontros individuais sobre um único problema, com decisões registradas, aplicação na empresa e revisão do resultado — tudo dentro de um mês. O foco está no que acontece depois que a ideia é discutida.',
    },
    {
      question: 'Os encontros são presenciais ou online?',
      answer: 'Você escolhe. Os encontros podem ser presenciais ou online, conforme a sua agenda.',
    },
    {
      question: 'E se não fizer sentido para mim?',
      answer:
        'Você agenda o primeiro encontro antes de fechar e ainda tem garantia nos dois primeiros encontros: se não fizer sentido, devolvemos o valor.',
    },
    {
      question: 'O mentor implementa as ações dentro da minha empresa?',
      answer:
        'Não. A orientação questiona, estrutura e revisa — quem executa é a sua empresa. É isso que faz a mudança ficar.',
    },
    {
      question: 'Posso trabalhar vários problemas ao mesmo tempo?',
      answer:
        'A proposta é o contrário: um problema específico por vez, com foco total até ele ser resolvido. Depois, você pode começar um novo ciclo.',
    },
  ],
};
