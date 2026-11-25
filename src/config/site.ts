import alanSilvaWordmark from '@/assets/images/brand/alan-silva-wordmark.png';
import scaleClubLogo from '@/assets/images/brand/scale-club-logo.png';
import type { LinkItem } from '@/components/types';
import { routes } from '@/config/routes';

export const contact = {
  email: 'scale@criamosmomentum.com',
  whatsappUrl: 'https://wa.me/5544998539056',
  instagramUrl: 'https://www.instagram.com/alang.silva/',
  linkedinUrl: 'https://www.linkedin.com/in/alan-silva-79714617/',
  youtubeUrl: 'https://www.youtube.com/@alang-silva',
};

export const brandLockup = {
  primary: { src: scaleClubLogo, alt: 'Momentum Scale Club' },
  secondary: { src: alanSilvaWordmark, alt: 'Alan Silva' },
};

export const siteConfig = {
  name: 'Momentum Scale Club',
  title: 'Momentum Scale Club | Alan Silva',
  description:
    'Mentoria empresarial para empresários que querem evoluir gestão, comercial, marketing, produto, tecnologia e operação de forma integrada.',
  language: 'pt-BR',
  openGraphLocale: 'pt_BR',
  themeColor: '#060606',
  tagline: 'Pessoas. Processos. Sistemas.',
};

/** Existing public anchors, kept in Portuguese so links already shared keep working. */
export const homeSections = {
  top: 'top',
  pps: 'pps',
  methodology: 'metodologia',
  areas: 'areas',
  mentor: 'mentor',
  cases: 'casos',
  table: 'a-mesa',
} as const;

export interface SiteNavigation {
  items: readonly LinkItem[];
  callToAction: LinkItem;
}

export const homeNavigation: SiteNavigation = {
  items: [
    { href: `/#${homeSections.pps}`, label: 'PPS' },
    { href: `/#${homeSections.methodology}`, label: 'Metodologia' },
    { href: `/#${homeSections.areas}`, label: 'Áreas de atuação' },
    { href: `/#${homeSections.mentor}`, label: 'Mentor' },
    { href: `/#${homeSections.cases}`, label: 'Casos' },
    { href: `/#${homeSections.table}`, label: 'A Mesa' },
  ],
  callToAction: { href: contact.whatsappUrl, label: 'Quero ser mentorado', external: true },
};

export const footerContent = {
  description: 'Mentoria empresarial para empresários que querem crescer com estrutura, decisão e consistência.',
  newsletterTitle: 'Receba conteúdos sobre gestão, processos e crescimento.',
  navigationTitle: 'Navegação',
  navigation: [
    { href: `/#${homeSections.pps}`, label: 'PPS' },
    { href: `/#${homeSections.methodology}`, label: 'Metodologia' },
    { href: `/#${homeSections.areas}`, label: 'Áreas de atuação' },
    { href: `/#${homeSections.cases}`, label: 'Casos' },
    { href: routes.table, label: 'A Mesa' },
  ] satisfies LinkItem[],
  contactTitle: 'Contato',
  contacts: [
    { href: `mailto:${contact.email}`, label: contact.email },
    { href: contact.whatsappUrl, label: 'WhatsApp', external: true },
    { href: contact.instagramUrl, label: 'Instagram', external: true },
    { href: contact.linkedinUrl, label: 'LinkedIn', external: true },
    { href: contact.youtubeUrl, label: 'YouTube', external: true },
  ] satisfies LinkItem[],
  copyright: '© 2026 Momentum Scale Club. Todos os direitos reservados.',
};

export const formMessages = {
  invalid: 'Confira os campos destacados.',
  rateLimited: 'Muitas tentativas seguidas. Espere alguns minutos ou fale com a gente no WhatsApp.',
  error: 'Não foi possível enviar agora. Tente de novo ou fale com a gente no WhatsApp.',
};

export const interfaceText = {
  homeLink: 'Momentum Scale Club, página inicial',
  openMenu: 'Abrir menu',
  closeMenu: 'Fechar menu',
  primaryNavigation: 'Navegação principal',
  footerNavigation: 'Rodapé',
  backToTop: 'Voltar ao topo',
  skipToContent: 'Pular para o conteúdo',
  opensInNewTab: '(abre em nova aba)',
};
