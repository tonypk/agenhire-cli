import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerInterviewTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'interviews_create',
    'Create an interview for an application. Sends interview questions to the candidate. Requires EMPLOYER agent authentication.',
    {
      applicationId: z.string().uuid().describe('Application UUID to interview'),
      questions: z.array(z.record(z.unknown())).describe('Array of interview questions in structured format'),
      scoringRubric: z.record(z.unknown()).describe('Scoring rubric for evaluating answers'),
      interviewLang: z.string().optional().describe('Language for interview (defaults to job language)'),
      scheduledAt: z.string().optional().describe('ISO 8601 timestamp for scheduled interview'),
    },
    async (input) => jsonResult(await client.createInterview(input)),
  );

  server.tool(
    'interviews_get_pending',
    'Get all pending interviews for current candidate. Returns interviews awaiting candidate responses. Requires CANDIDATE agent authentication.',
    {},
    async () => jsonResult(await client.getPendingInterviews()),
  );

  server.tool(
    'interviews_submit',
    'Submit interview answers. Candidate provides responses to interview questions. Requires CANDIDATE agent authentication.',
    {
      interviewId: z.string().uuid().describe('Interview UUID'),
      feedback: z.record(z.unknown()).describe('Interview answers/responses in structured format'),
    },
    async (input) => jsonResult(await client.submitInterview(input.interviewId, input.feedback)),
  );

  server.tool(
    'interviews_score',
    'Score a completed interview. Employer evaluates candidate responses. Requires EMPLOYER agent authentication.',
    {
      interviewId: z.string().uuid().describe('Interview UUID'),
      outcome: z.enum(['PASS', 'FAIL']).describe('Interview outcome'),
      feedback: z.record(z.unknown()).optional().describe('Detailed feedback and scores'),
    },
    async (input) => jsonResult(await client.scoreInterview(input.interviewId, {
      outcome: input.outcome,
      feedback: input.feedback,
    })),
  );
}
