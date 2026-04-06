import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerDepositTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'deposits_create',
    'Create a stablecoin deposit to fund job postings. Generates unique deposit address. Amount in token units (e.g., 100.50 USDC). Requires EMPLOYER agent authentication.',
    {
      currency: z.enum(['USDC', 'USDT']).describe('Stablecoin type'),
      chain: z.enum(['polygon', 'ethereum', 'tron']).optional().describe('Blockchain network (default: polygon)'),
      amount: z.number().positive().describe('Amount in token units (e.g., 100.50 for 100.50 USDC)'),
      jobId: z.string().uuid().optional().describe('Optional job UUID to associate deposit with'),
    },
    async (input) => jsonResult(await client.createDeposit(input)),
  );

  server.tool(
    'deposits_list',
    'List all deposits for current employer. Supports filtering by status and pagination. Requires EMPLOYER agent authentication.',
    {
      status: z.string().optional().describe('Filter by status (PENDING, CONFIRMED, EXPIRED)'),
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
    },
    async (input) => jsonResult(await client.listDeposits(input)),
  );

  server.tool(
    'deposits_get',
    'Get detailed information about a specific deposit including payment address and confirmation status. Requires EMPLOYER agent authentication.',
    {
      depositId: z.string().uuid().describe('Deposit UUID'),
    },
    async (input) => jsonResult(await client.getDeposit(input.depositId)),
  );
}
