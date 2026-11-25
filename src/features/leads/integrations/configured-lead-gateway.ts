import type { LeadGateway } from '../domain/lead-gateway';

/** No destination is chosen yet: add an adapter in this folder and return it here from validated configuration. */
export function resolveConfiguredLeadGateway(): LeadGateway | null {
  return null;
}
