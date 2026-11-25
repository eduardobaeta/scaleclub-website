import fatorcardLogo from '@/assets/images/logos/fatorcard.svg';
import flycostLogo from '@/assets/images/logos/flycost.svg';
import freeFlightLogo from '@/assets/images/logos/free-flight.svg';
import optaLogo from '@/assets/images/logos/opta.svg';
import prosperaLogo from '@/assets/images/logos/prospera.svg';

export const companyKeys = ['opta', 'fatorcard', 'prospera', 'flycost', 'freeFlight'] as const;
export type CompanyKey = (typeof companyKeys)[number];

export interface Company {
  name: string;
  logo: typeof optaLogo;
  href: string;
  compact?: boolean;
  surface?: string;
}

export const companies: Record<CompanyKey, Company> = {
  opta: { name: 'Opta Promotora', logo: optaLogo, href: 'https://www.optapromotora.com' },
  fatorcard: {
    name: 'Fatorcard',
    logo: fatorcardLogo,
    href: 'https://www.fatorcard.com.br',
    compact: true,
    surface: 'bg-fatorcard',
  },
  prospera: { name: 'Próspera', logo: prosperaLogo, href: 'https://prosperapagamentos.com', surface: 'bg-prospera' },
  flycost: { name: 'Flycost', logo: flycostLogo, href: 'https://flycost.com.br' },
  freeFlight: { name: 'Free Flight', logo: freeFlightLogo, href: 'https://www.freeflightbrasil.com.br', compact: true },
};
