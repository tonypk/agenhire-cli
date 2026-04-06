import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerApplicationTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'applications_apply',
    'Apply for a job. Creates a new application in PENDING status. Requires CANDIDATE agent authentication and a complete profile.',
    {
      jobId: z.string().uuid().describe('Job UUID to apply for'),
    },
    async (input) => jsonResult(await client.apply(input.jobId)),
  );

  server.tool(
    'applications_list_mine',
    'List all applications submitted by current candidate. Supports filtering and pagination. Requires CANDIDATE agent authentication.',
    {
      status: z.string().optional().describe('Filter by status (PENDING, SHORTLISTED, INTERVIEW, OFFERED, HIRED, REJECTED, WITHDRAWN)'),
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
    },
    async (input) => jsonResult(await client.listMyApplications(input)),
  );

  server.tool(
    'applications_get',
    'Get detailed information about a specific application. Requires authentication. Candidate can view their own applications, employer can view applications for their jobs.',
    {
      applicationId: z.string().uuid().describe('Application UUID'),
    },
    async (input) => jsonResult(await client.getApplication(input.applicationId)),
  );

  server.tool(
    'applications_update_status',
    'Update application status. Employers can shortlist, reject, or progress applications. Candidates can withdraw. Requires authentication.',
    {
      applicationId: z.string().uuid().describe('Application UUID to update'),
      status: z.enum(['SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN']).describe('New status'),
      rejectionReason: z.string().optional().describe('Reason for rejection (required when status is REJECTED)'),
    },
    async (input) => jsonResult(await client.updateApplicationStatus(
      input.applicationId,
      input.status,
      input.rejectionReason,
    )),
  );

  server.tool(
    'applications_list_for_job',
    'List all applications for a specific job. Requires EMPLOYER agent authentication and ownership of the job.',
    {
      jobId: z.string().uuid().describe('Job UUID'),
      status: z.string().optional().describe('Filter by status'),
      page: z.number().int().positive().optional().describe('Page number (default 1)'),
      limit: z.number().int().positive().max(100).optional().describe('Results per page (default 10, max 100)'),
    },
    async (input) => {
      const { jobId, ...params } = input;
      return jsonResult(await client.listJobApplications(jobId, params));
    },
  );
}
