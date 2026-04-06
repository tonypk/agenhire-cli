import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerOfferTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'offers_create',
    'Create a job offer for an application in DRAFT status. Requires EMPLOYER agent authentication. Salary in smallest currency unit (USD cents, JPY yen). Use offers_send to send it to candidate.',
    {
      applicationId: z.string().uuid().describe('Application UUID to make offer for'),
      salary: z.number().int().positive().describe('Offer salary in smallest currency unit (cents for USD)'),
      currency: z.string().length(3).describe('Currency code (USD, EUR, PHP, etc.)'),
      workArrangement: z.enum(['ON_SITE', 'HYBRID', 'FULL_REMOTE', 'REMOTE_FRIENDLY']).describe('Work arrangement'),
      startDate: z.string().optional().describe('Proposed start date (ISO 8601 format)'),
      conditions: z.record(z.unknown()).optional().describe('Employment conditions, benefits, terms in structured format'),
      expiresInDays: z.number().int().min(1).max(30).optional().describe('Days until offer expires (1-30, default 7)'),
    },
    async (input) => jsonResult(await client.createOffer(input)),
  );

  server.tool(
    'offers_send',
    'Send a DRAFT offer to the candidate. Changes status to SENT. Requires EMPLOYER agent authentication.',
    {
      offerId: z.string().uuid().describe('Offer UUID to send'),
    },
    async (input) => jsonResult(await client.sendOffer(input.offerId)),
  );

  server.tool(
    'offers_respond',
    'Respond to a received offer. Candidate can accept, reject, or request negotiation. Requires CANDIDATE agent authentication.',
    {
      offerId: z.string().uuid().describe('Offer UUID to respond to'),
      action: z.enum(['ACCEPT', 'REJECT', 'NEGOTIATE']).describe('Response action'),
    },
    async (input) => jsonResult(await client.respondToOffer(input.offerId, input.action)),
  );

  server.tool(
    'offers_withdraw',
    'Withdraw an offer before candidate responds. Cannot withdraw accepted offers. Requires EMPLOYER agent authentication.',
    {
      offerId: z.string().uuid().describe('Offer UUID to withdraw'),
    },
    async (input) => jsonResult(await client.withdrawOffer(input.offerId)),
  );

  server.tool(
    'offers_negotiate',
    'Submit a negotiation proposal for an offer. Can propose different salary, conditions, or start date. Requires authentication (candidate or employer).',
    {
      offerId: z.string().uuid().describe('Offer UUID to negotiate'),
      proposedSalary: z.number().int().positive().optional().describe('Proposed salary in smallest currency unit'),
      proposedConditions: z.record(z.unknown()).optional().describe('Proposed employment conditions'),
      startDate: z.string().optional().describe('Proposed start date (ISO 8601 format)'),
      message: z.string().min(1).max(2000).describe('Negotiation message explaining the proposal'),
    },
    async (input) => {
      const { offerId, ...negotiateData } = input;
      return jsonResult(await client.negotiateOffer(offerId, negotiateData));
    },
  );

  server.tool(
    'offers_list_negotiations',
    'List all negotiation rounds for an offer. Shows negotiation history. Requires authentication.',
    {
      offerId: z.string().uuid().describe('Offer UUID'),
    },
    async (input) => jsonResult(await client.listNegotiations(input.offerId)),
  );
}
