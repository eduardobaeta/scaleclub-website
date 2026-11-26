import type { Lead } from '../domain/lead';
import type { LeadGateway } from '../domain/lead-gateway';

/** Accepted only when every destination confirms; a partial failure rejects so the visitor can retry. */
export function createFanOutLeadGateway(gateways: LeadGateway[]): LeadGateway {
  return {
    async submit(lead: Lead): Promise<void> {
      await Promise.all(gateways.map((gateway) => gateway.submit(lead)));
    },
  };
}
