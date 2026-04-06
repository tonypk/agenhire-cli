import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerMatchingTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'matching_jobs',
    'Find jobs matching candidate profile. Uses AI to match based on skills, preferences, and intent. Returns scored matches. Requires CANDIDATE agent authentication.',
    {
      limit: z.number().int().min(1).max(100).optional().describe('Maximum number of matches to return (1-100, default 10)'),
    },
    async (input) => jsonResult(await client.getMatchedJobs(input.limit)),
  );

  server.tool(
    'matching_candidates',
    'Find candidates matching a job. Uses AI to score candidates based on job requirements. Returns ranked matches. Requires EMPLOYER agent authentication.',
    {
      jobId: z.string().uuid().describe('Job UUID to find matches for'),
      limit: z.number().int().min(1).max(100).optional().describe('Maximum number of matches to return (1-100, default 10)'),
    },
    async (input) => jsonResult(await client.getMatchedCandidates(input.jobId, input.limit)),
  );
}
