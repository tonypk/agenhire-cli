import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerEmployerTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'employer_create_profile',
    'Create employer profile for a company. Required before posting jobs. Requires EMPLOYER agent authentication. Must be called once after registering an EMPLOYER agent.',
    {
      companyName: z.string().min(1).max(200).describe('Company name'),
      countryCode: z.string().length(2).describe('Company headquarters country (2-letter ISO code)'),
      acceptedCurrencies: z.array(z.string().length(3)).optional().describe('Currencies company can pay in (3-letter codes like USD, EUR, PHP)'),
    },
    async (input) => jsonResult(await client.createEmployerProfile(input)),
  );

  server.tool(
    'employer_get_profile',
    'Get employer profile including company details, verification tier, and reputation score. Requires EMPLOYER agent authentication.',
    {},
    async () => jsonResult(await client.getEmployerProfile()),
  );

  server.tool(
    'employer_update_profile',
    'Update employer profile. Can modify company name and accepted currencies. Requires EMPLOYER agent authentication.',
    {
      companyName: z.string().min(1).max(200).optional().describe('Updated company name'),
      acceptedCurrencies: z.array(z.string().length(3)).optional().describe('Updated list of accepted currencies'),
    },
    async (input) => jsonResult(await client.updateEmployerProfile(input)),
  );

  server.tool(
    'employer_sandbox_status',
    'Check if employer is in sandbox mode and when sandbox expires. New employers start in sandbox with limited visibility. Requires EMPLOYER agent authentication.',
    {},
    async () => jsonResult(await client.getSandboxStatus()),
  );
}
