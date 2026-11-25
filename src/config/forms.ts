import { formMessages } from './site';

const field = {
  name: { label: 'Nome', placeholder: 'Seu nome', error: 'Informe seu nome.' },
  email: { label: 'E-mail', placeholder: 'voce@empresa.com', error: 'Confira o e-mail informado.' },
  whatsapp: { label: 'WhatsApp', placeholder: '(11) 99999-9999', error: 'Informe um WhatsApp com DDD.' },
};

const consent = {
  label: 'Concordo em receber comunicações da Momentum e com o tratamento dos meus dados para contato.',
  error: 'Confirme o consentimento para continuar.',
};

export const meetingRequestForm = {
  fields: {
    ...field,
    whatsapp: { ...field.whatsapp, label: 'WhatsApp (opcional)', error: 'Confira o WhatsApp com DDD.' },
  },
  consent,
  submitLabel: 'Quero agendar meu primeiro encontro',
  messages: { ...formMessages, success: 'Recebemos seus dados. Vamos chamar você para agendar o primeiro encontro.' },
};

export const mentoringApplicationForm = {
  fields: {
    ...field,
    company: { label: 'Empresa', placeholder: 'Nome da empresa', error: 'Informe a empresa.' },
    role: { label: 'Cargo', placeholder: 'Dono, sócio…', error: 'Informe seu cargo.' },
    teamSize: {
      label: 'Tamanho da equipe',
      error: 'Escolha uma opção.',
      options: [
        { value: '1-4', label: '1 a 4 pessoas' },
        { value: '5-20', label: '5 a 20 pessoas' },
        { value: '21-50', label: '21 a 50 pessoas' },
        { value: '50+', label: 'Mais de 50 pessoas' },
      ],
    },
    problem: {
      label: 'Qual problema continua voltando para você?',
      placeholder: 'Descreva em poucas linhas',
      error: 'Use no máximo 1.000 caracteres.',
    },
    consent,
  },
  submitLabel: 'Quero agendar meu primeiro encontro',
  messages: { ...formMessages, success: 'Recebemos seus dados. Vamos chamar você para agendar o primeiro encontro.' },
};

export const ebookRequestForm = {
  fields: {
    name: field.name,
    email: field.email,
    instagram: { label: 'Instagram (opcional)', placeholder: '@seuperfil', error: 'Use no máximo 60 caracteres.' },
    consent: { ...consent, label: 'Concordo em receber comunicações da Momentum e com o tratamento dos meus dados.' },
  },
  submitLabel: 'Quero o ebook gratuito',
  messages: { ...formMessages, success: 'Pronto! Seu acesso ao ebook foi registrado.' },
};

export const newsletterForm = {
  email: { label: 'E-mail', placeholder: 'Seu e-mail', error: 'Confira o e-mail informado.' },
  submitLabel: 'Assinar',
  messages: { ...formMessages, success: 'Inscrição feita. Você vai receber os próximos conteúdos.' },
};
