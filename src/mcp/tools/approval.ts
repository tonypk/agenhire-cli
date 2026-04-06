import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerApprovalTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'approval_get',
    'Get approval request details by token. Used to view pending approval requests. No authentication required - uses approval token from email/notification.',
    {
      token: z.string().min(1).describe('Approval token from notification or email'),
    },
    async (input) => jsonResult(await client.getApproval(input.token)),
  );

  server.tool(
    'approval_resolve',
    'Resolve an approval request. Approve or deny the pending action. No authentication required - uses approval token.',
    {
      token: z.string().min(1).describe('Approval token from notification or email'),
      decision: z.enum(['APPROVE', 'DENY']).describe('Approval decision'),
    },
    async (input) => jsonResult(await client.resolveApproval(input.token, input.decision)),
  );
}
