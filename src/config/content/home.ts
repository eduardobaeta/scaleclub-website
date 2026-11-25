import type { ImageMetadata } from 'astro';
import alanSilva from '@/assets/images/alan-silva-hangar.jpg';
import client1 from '@/assets/images/client-1.jpg';
import client2 from '@/assets/images/client-2.jpg';
import client3 from '@/assets/images/client-3.jpg';
import client4 from '@/assets/images/client-4.jpg';
import heroMeshDesktop from '@/assets/images/hero-mesh-desktop.jpg';
import heroMeshPhone from '@/assets/images/hero-mesh-phone.jpg';
import { contact, homeNavigation, homeSections } from '../site';
import { caseStudyPage } from './case-studies';
import { companies } from './companies';
import { routes } from '../routes';

const tableFrames = import.meta.glob<{ default: ImageMetadata }>('@/assets/images/table/table-frame-*.jpg', {
  eager: true,
});

export type BadgeTone = 'dark' | 'primary' | 'deep' | 'light';

interface HeroBadge {
  label: string;
  tone: BadgeTone;
  /** Position, tilt and size measured on the 1440 × 900 reference, as classes because the CSP blocks style attributes. */
  placement: string;
}

export const homePage = {
  title: 'Momentum Scale Club | Alan Silva',
  description:
    'Mentoria empresarial para empresários que querem evoluir gestão, comercial, marketing, produto, tecnologia e operação de forma integrada.',
  navigation: homeNavigation,
};

export const heroContent = {
  id: homeSections.top,
  proof: { text: '+100 empresários confiam na mentoria', avatars: [client1, client2, client3, client4] },
  title: 'Estruture melhor. Decida melhor. Cresça com mais consistência.',
  lead: 'A Momentum Scale Club é uma mentoria empresarial para empresários que querem evoluir gestão, comercial, marketing, produto, tecnologia e operação de forma integrada.',
  note: 'Com acompanhamento estratégico, aplicação prática e uma metodologia baseada em Pessoas, Processos e Sistemas, a mentoria ajuda a transformar desafios do dia a dia em decisões mais claras e ações que realmente avançam o negócio.',
  action: { href: contact.whatsappUrl, label: 'Quero ser mentorado', external: true },
  background: { desktop: heroMeshDesktop, phone: heroMeshPhone },
  badges: [
    { label: 'Liderança', tone: 'dark', placement: 'left-[13.19%] top-[12.89%] -rotate-8 scale-100' },
    { label: 'Metas', tone: 'primary', placement: 'left-[32.64%] top-[12.22%] rotate-4 scale-125' },
    { label: 'Decisão', tone: 'dark', placement: 'left-[60.76%] top-[11.67%] -rotate-3 scale-95' },
    { label: 'Responsabilidades', tone: 'deep', placement: 'left-[73.68%] top-[14.67%] rotate-5 scale-110' },
    { label: 'Funil', tone: 'dark', placement: 'left-[10.42%] top-[24.67%] rotate-5 scale-120' },
    { label: 'Priorização', tone: 'light', placement: 'left-[83.40%] top-[26.11%] -rotate-6 scale-85' },
    { label: 'Padronização', tone: 'dark', placement: 'left-[11.81%] top-[50.00%] -rotate-6 scale-105' },
    { label: 'Produtividade', tone: 'primary', placement: 'left-[79.10%] top-[59.33%] rotate-5 scale-125' },
    { label: 'Indicadores', tone: 'dark', placement: 'left-[18.75%] top-[85.78%] rotate-3 scale-90' },
    { label: 'Dados', tone: 'deep', placement: 'left-[38.19%] top-[89.56%] -rotate-5 scale-110' },
    { label: 'Automação', tone: 'dark', placement: 'left-[55.90%] top-[86.44%] rotate-5 scale-100' },
    { label: 'Previsibilidade', tone: 'light', placement: 'left-[71.32%] top-[84.89%] -rotate-6 scale-115' },
  ] satisfies HeroBadge[],
};

export const ppsContent = {
  id: homeSections.pps,
  tagline: 'Pessoas. Processos. Sistemas.',
  lines: ['Pessoas fazem acontecer.', 'Processos organizam.', 'Sistemas sustentam o crescimento.'],
  letters: ['P', 'P', 'S'],
};

export const challengesContent = {
  title: 'Crescimento não acontece em uma área isolada.',
  description:
    'A mentoria ajuda o empresário a identificar o que realmente precisa mudar, estabelecer prioridades e construir uma estrutura capaz de sustentar os próximos passos do negócio.',
  statement: 'À medida que uma empresa evolui, os desafios começam a se conectar.',
  cards: [
    {
      title: 'Dificuldade comercial',
      description:
        'Quando as vendas travam, a causa raramente está só no time comercial. Muitas vezes é o posicionamento que não deixa claro por que escolher você.',
    },
    {
      title: 'Problema de produtividade',
      description:
        'Equipe ocupada e resultado que não aparece costuma ser sinal de processo: etapas mal definidas, retrabalho e decisões que voltam.',
    },
    {
      title: 'Limitação de crescimento',
      description:
        'A empresa quer crescer, mas a estrutura do time não acompanha: responsabilidades difusas e tudo passando pelo dono.',
    },
    {
      title: 'Decisão de tecnologia',
      description:
        'Uma escolha de sistema ou automação mal feita impacta a operação inteira — do atendimento ao financeiro.',
    },
    {
      title: 'Marketing sem direção',
      description:
        'Investimento em mídia e conteúdo que não vira demanda quase sempre é falta de alinhamento entre marketing e comercial.',
    },
    {
      title: 'Produto que não evolui',
      description:
        'Quando o cliente não percebe valor novo, o problema costuma estar na priorização: muita ideia, pouca decisão sobre o que entregar.',
    },
  ],
};

export const methodologyContent = {
  id: homeSections.methodology,
  title: 'Estratégia aplicada à realidade da sua empresa',
  description: 'Cada empresa está em um estágio diferente, com pessoas, mercados, estruturas e desafios próprios.',
  steps: [
    {
      index: '01',
      title: 'Diagnosticar',
      description: 'Entender o momento atual, os objetivos e os principais desafios da empresa.',
    },
    { index: '02', title: 'Priorizar', description: 'Separar o que realmente importa do que apenas parece urgente.' },
    {
      index: '03',
      title: 'Estruturar',
      description: 'Definir pessoas, processos, indicadores e soluções necessários para avançar.',
    },
    {
      index: '04',
      title: 'Implementar',
      description: 'Colocar as decisões em prática dentro da realidade da operação.',
    },
    { index: '05', title: 'Metrificar', description: 'Observar resultados, dificuldades e novos aprendizados.' },
    { index: '06', title: 'Evoluir', description: 'Revisar, melhorar e começar um novo ciclo.' },
  ],
};

export const areasContent = {
  id: homeSections.areas,
  title: 'Os principais desafios da empresa na mesma mesa.',
  description:
    'A mentoria transita pelas diferentes áreas do negócio de acordo com o momento e as prioridades de cada empresa.',
  areas: [
    {
      name: 'Gestão',
      description: 'Clareza para liderar: estrutura, indicadores e planejamento que transformam decisão em rotina.',
    },
    {
      name: 'Comercial',
      description: 'Receita previsível: processo de vendas, metas, canais e funil que o time consegue executar.',
    },
    {
      name: 'Marketing',
      description: 'Demanda com direção: posicionamento e aquisição alinhados ao que o comercial precisa fechar.',
    },
    {
      name: 'Produto',
      description: 'Valor que o cliente percebe: experiência, priorização e evolução contínua do que você entrega.',
    },
    {
      name: 'Operacional',
      description: 'Operação que sustenta o crescimento: processos, responsabilidades e controles claros.',
    },
    {
      name: 'Tecnologia',
      description:
        'Sistemas, dados e IA a serviço do negócio: automação e integração para escalar sem perder o controle.',
    },
  ],
};

export const mentorContent = {
  id: homeSections.mentor,
  eyebrow: 'O mentor',
  name: 'Alan Silva',
  role: 'Empresário · comercial, estratégia e produto',
  photo: { src: alanSilva, alt: 'Alan Silva com um notebook sobre a asa de um avião Pilatus, dentro de um hangar' },
  paragraphs: [
    'Empresário com experiência prática na construção, desenvolvimento e crescimento de negócios, com atuação principalmente nas áreas comercial, estratégia e produto.',
    'Alan é sócio da Próspera, antiga Parciom, empresa posteriormente vendida ao Grupo Consilux, de Curitiba.',
    'Hoje continua diretamente envolvido na construção de diferentes negócios.',
  ],
  companiesTitle: 'Empresas',
  companies: Object.values(companies),
};

export const casesContent = {
  id: homeSections.cases,
  title: 'Casos reais, decisões que viraram resultado.',
  description:
    'Alguns exemplos de como a mentoria atua na prática — sempre a partir do momento e das prioridades de cada empresa.',
  action: caseStudyPage.cardAction,
  scopeLabel: caseStudyPage.scopeLabel,
};

export const tableContent = {
  id: homeSections.table,
  title: 'A MESA',
  frames: Object.entries(tableFrames)
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, image]) => image.default),
  statements: [
    'Você traz um problema real.',
    'A mesa aprofunda o problema.',
    'Seis encontros, um único foco.',
    'Em um mês, a decisão sai do papel.',
  ],
  edition: {
    eyebrow: 'Mentoria individual · presencial ou online',
    title: 'Um problema resolvido em um mês.',
    description:
      'Encontros individuais com o Alan Silva para resolver rápido aquele problema específico que trava a sua empresa. Você agenda o primeiro encontro antes de fechar.',
    facts: ['6 encontros individuais', 'Presencial ou online', '4 vagas por mês'],
    price: { installments: '12x de R$ 399,99', cash: 'ou R$ 4.500,00 à vista' },
    link: { href: routes.table, label: 'Conhecer A Mesa' },
  },
  form: {
    title: 'Agende seu primeiro encontro',
    description: '4 empresários por mês. Deixe seus dados e entraremos em contato.',
  },
};

export const homeFaqContent = {
  title: 'Respostas rápidas para as dúvidas mais comuns.',
  contact: { prefix: 'Ainda com dúvidas?', label: 'Fale com a gente.', href: contact.whatsappUrl },
  items: [
    {
      question: 'Como funciona a mentoria?',
      answer:
        'Encontros periódicos com o mentor, com acompanhamento estratégico e aplicação prática. Você traz os desafios reais da empresa; a mentoria traz estrutura, método e direção para transformá-los em decisões e ações.',
    },
    {
      question: 'Para quem é a Momentum Scale Club?',
      answer:
        'Para empresários que querem evoluir gestão, comercial, marketing, produto, tecnologia e operação de forma integrada — e estão dispostos a colocar as decisões em prática.',
    },
    {
      question: 'Em quanto tempo vejo resultado?',
      answer:
        'Depende do momento da empresa, mas as primeiras mudanças de clareza e prioridade costumam aparecer nas primeiras semanas. A consistência vem da rotina de execução e acompanhamento.',
    },
    {
      question: 'O que é A Mesa?',
      answer:
        'A mentoria individual do Alan para resolver um problema específico da sua empresa: seis encontros, presenciais ou online, dentro de um mês.',
    },
    {
      question: 'Como agendo o primeiro encontro da Mesa?',
      answer:
        'Deixe seus dados no formulário da Mesa ou fale com a gente. Você agenda o primeiro encontro antes de fechar e tem garantia nos dois primeiros encontros.',
    },
  ],
};
