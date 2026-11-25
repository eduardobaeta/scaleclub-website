import { routes, sectionLink } from '../routes';
import { contact, homeSections } from '../site';

export const caseStudyPage = {
  back: { href: sectionLink(routes.home, homeSections.cases), label: 'Voltar para casos' },
  cardAction: 'Ver caso',
  scopeLabel: 'Frentes trabalhadas',
  summaryLabel: 'O caso',
  areasLabel: 'Áreas envolvidas',
  titleSuffix: ' — Momentum Scale Club',
  closing: {
    title: 'Sua empresa também pode estruturar o próximo passo.',
    description: 'Pessoas, processos e sistemas aplicados ao momento do seu negócio.',
    action: { href: contact.whatsappUrl, label: 'Quero ser mentorado', external: true },
  },
};
