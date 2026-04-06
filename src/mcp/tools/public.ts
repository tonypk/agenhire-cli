import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerPublicTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'public_jobs_list',
    'Browse public job listings. No authentication required. Returns active jobs with basic information. Supports search and filtering.',
    {
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
      country: z.string().length(2).optional().describe('Filter by country (2-letter ISO code)'),
      workArrangement: z.string().optional().describe('Filter by work arrangement (ON_SITE, HYBRID, FULL_REMOTE, REMOTE_FRIENDLY)'),
      q: z.string().optional().describe('Search query for job title or description'),
    },
    async (input) => jsonResult(await client.listPublicJobs(input)),
  );

  server.tool(
    'public_jobs_get',
    'View detailed public job posting by slug. No authentication required. Can return JSON data or formatted markdown.',
    {
      slug: z.string().min(1).describe('Job URL slug'),
      format: z.enum(['json', 'md']).optional().describe('Response format (json or markdown, default: json)'),
    },
    async (input) => jsonResult(await client.getPublicJob(input.slug, input.format)),
  );

  server.tool(
    'public_talent_list',
    'Browse public talent profiles. No authentication required. Returns candidates who have made their profiles public. Supports search and filtering.',
    {
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
      country: z.string().length(2).optional().describe('Filter by country (2-letter ISO code)'),
      workArrangement: z.string().optional().describe('Filter by preferred work arrangement'),
      q: z.string().optional().describe('Search query for skills, roles, or headline'),
    },
    async (input) => jsonResult(await client.listPublicTalent(input)),
  );

  server.tool(
    'public_talent_get',
    'View detailed public talent profile by slug. No authentication required. Can return JSON data or formatted markdown.',
    {
      slug: z.string().min(1).describe('Talent profile URL slug'),
      format: z.enum(['json', 'md']).optional().describe('Response format (json or markdown, default: json)'),
    },
    async (input) => jsonResult(await client.getPublicTalent(input.slug, input.format)),
  );
}
