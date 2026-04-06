import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerComplianceTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'compliance_tips',
    'Get compliance tips and warnings for cross-border employment. Provides regulatory guidance based on trigger context. Requires authentication.',
    {
      trigger: z.enum(['job_creation', 'application', 'offer_creation', 'cross_border']).describe('Context that triggered compliance check'),
      jobCountry: z.string().length(2).optional().describe('Job location country (2-letter ISO code)'),
      employerCountry: z.string().length(2).optional().describe('Employer country (2-letter ISO code)'),
      candidateCountry: z.string().length(2).optional().describe('Candidate country (2-letter ISO code)'),
    },
    async (input) => jsonResult(await client.getComplianceTips(input)),
  );
}
