import type { LeadType } from '@/features/leads';
import type { LinkItem } from '@/components/types';
import { contact, homeNavigation } from '../site';
import { routes } from '../routes';

export interface MessagePageContent {
  title: string;
  eyebrow: string;
  heading: string;
  lead: string;
  actions: readonly LinkItem[];
}

const backToSite: LinkItem = { href: routes.home, label: 'Voltar ao site' };
const whatsapp: LinkItem = { href: contact.whatsappUrl, label: 'Falar no WhatsApp', external: true };

export const messageNavigation = homeNavigation;

export const thankYouContent: Record<LeadType, MessagePageContent> = {
  'meeting-request': {
    title: 'Dados recebidos · Momentum Scale Club',
    eyebrow: 'A Mesa',
    heading: 'Dados recebidos.',
    lead: 'Vamos chamar você para agendar o primeiro encontro da Mesa.',
    actions: [backToSite, whatsapp],
  },
  'mentoring-application': {
    title: 'Dados recebidos · Momentum Scale Club',
    eyebrow: 'A Mesa',
    heading: 'Dados recebidos.',
    lead: 'Vamos chamar você para agendar o primeiro encontro — você só fecha se fizer sentido.',
    actions: [{ href: routes.table, label: 'Voltar para A Mesa' }, whatsapp],
  },
  'ebook-request': {
    title: 'Ebook liberado · Momentum Scale Club',
    eyebrow: 'Double Diamond',
    heading: 'Pedido recebido.',
    lead: 'Seu acesso ao ebook do Double Diamond foi registrado.',
    actions: [{ href: routes.doubleDiamond, label: 'Voltar para a aula' }],
  },
  'newsletter-subscription': {
    title: 'Inscrição feita · Momentum Scale Club',
    eyebrow: 'Newsletter',
    heading: 'Inscrição feita.',
    lead: 'Você vai receber os próximos conteúdos sobre gestão, processos e crescimento.',
    actions: [backToSite],
  },
};

export const notFoundContent: MessagePageContent = {
  title: 'Página não encontrada · Momentum Scale Club',
  eyebrow: 'Erro 404',
  heading: 'Página não encontrada.',
  lead: 'Este endereço não existe ou mudou de lugar. Volte ao início ou conheça A Mesa.',
  actions: [backToSite, { href: routes.table, label: 'Conhecer A Mesa' }],
};

export const formErrorContent: MessagePageContent = {
  title: 'Envio não concluído · Momentum Scale Club',
  eyebrow: 'Formulário',
  heading: 'Não foi possível enviar.',
  lead: 'Confira os dados e tente de novo em alguns minutos, ou fale com a gente pelo WhatsApp.',
  actions: [backToSite, whatsapp],
};
