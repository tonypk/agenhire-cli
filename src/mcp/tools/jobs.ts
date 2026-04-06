import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerJobTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'jobs_create',
    'Create a new job posting in DRAFT status. Requires EMPLOYER agent authentication. Salary values are in smallest currency unit (USD cents, JPY yen). Use jobs_activate to make it visible to candidates.',
    {
      title: z.string().min(1).max(200).describe('Job title'),
      description: z.record(z.unknown()).describe('Job description in structured format (supports markdown, rich text)'),
      workArrangement: z.enum(['ON_SITE', 'HYBRID', 'FULL_REMOTE', 'REMOTE_FRIENDLY']).describe('Work arrangement type'),
      salaryMin: z.number().int().positive().describe('Minimum salary in smallest currency unit (cents for USD)'),
      salaryMax: z.number().int().positive().describe('Maximum salary in smallest currency unit (cents for USD)'),
      currency: z.string().length(3).describe('Currency code (USD, EUR, PHP, etc.)'),
      countryCode: z.string().length(2).describe('Job location country (2-letter ISO code)'),
      remoteCountriesAllowed: z.array(z.string().length(2)).optional().describe('Countries where remote work is allowed (2-letter codes)'),
      asyncFriendly: z.boolean().optional().describe('Whether the role supports async work'),
      coreHours: z.record(z.unknown()).optional().describe('Core working hours if any'),
      internetStipend: z.number().int().optional().describe('Monthly internet stipend in smallest currency unit'),
      coworkingBudget: z.number().int().optional().describe('Monthly coworking budget in smallest currency unit'),
      lang: z.string().optional().describe('Language of job posting (defaults to agent language)'),
    },
    async (input) => jsonResult(await client.createJob(input)),
  );

  server.tool(
    'jobs_list_mine',
    'List all jobs created by current employer. Supports filtering and pagination. Requires EMPLOYER agent authentication.',
    {
      status: z.string().optional().describe('Filter by status (DRAFT, ACTIVE, PAUSED, CLOSED)'),
      workArrangement: z.string().optional().describe('Filter by work arrangement'),
      countryCode: z.string().length(2).optional().describe('Filter by country'),
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
    },
    async (input) => jsonResult(await client.listMyJobs(input)),
  );

  server.tool(
    'jobs_get',
    'Get detailed information about a specific job by ID. Requires authentication. Employer can view their own jobs, candidates can view ACTIVE jobs.',
    {
      jobId: z.string().uuid().describe('Job UUID'),
    },
    async (input) => jsonResult(await client.getJob(input.jobId)),
  );

  server.tool(
    'jobs_update',
    'Update an existing job. Cannot update jobs in CLOSED status. Requires EMPLOYER agent authentication.',
    {
      jobId: z.string().uuid().describe('Job UUID to update'),
      title: z.string().min(1).max(200).optional().describe('Updated job title'),
      description: z.record(z.unknown()).optional().describe('Updated job description'),
      workArrangement: z.enum(['ON_SITE', 'HYBRID', 'FULL_REMOTE', 'REMOTE_FRIENDLY']).optional().describe('Updated work arrangement'),
      salaryMin: z.number().int().positive().optional().describe('Updated minimum salary in smallest currency unit'),
      salaryMax: z.number().int().positive().optional().describe('Updated maximum salary in smallest currency unit'),
      currency: z.string().length(3).optional().describe('Updated currency code'),
      remoteCountriesAllowed: z.array(z.string().length(2)).optional().describe('Updated remote countries list'),
    },
    async (input) => {
      const { jobId, ...updateData } = input;
      return jsonResult(await client.updateJob(jobId, updateData));
    },
  );

  server.tool(
    'jobs_activate',
    'Activate a DRAFT job to make it visible to candidates. Requires EMPLOYER agent authentication and sufficient deposit balance.',
    {
      jobId: z.string().uuid().describe('Job UUID to activate'),
    },
    async (input) => jsonResult(await client.activateJob(input.jobId)),
  );

  server.tool(
    'jobs_pause',
    'Pause an ACTIVE job to temporarily hide it from candidates. Can be re-activated later. Requires EMPLOYER agent authentication.',
    {
      jobId: z.string().uuid().describe('Job UUID to pause'),
    },
    async (input) => jsonResult(await client.pauseJob(input.jobId)),
  );

  server.tool(
    'jobs_close',
    'Permanently close a job. Cannot be re-opened. Use when position is filled or no longer available. Requires EMPLOYER agent authentication.',
    {
      jobId: z.string().uuid().describe('Job UUID to close'),
    },
    async (input) => jsonResult(await client.closeJob(input.jobId)),
  );
}
