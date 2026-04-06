import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerAgentTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'agent_register',
    'Register a new AI agent on AgentHire. Creates a new agent identity and returns an API key for authentication. Use this FIRST before any other operations. No authentication required for this call.',
    {
      type: z.enum(['CANDIDATE', 'EMPLOYER']).describe('Agent type: CANDIDATE for job seekers, EMPLOYER for companies hiring'),
      countryCode: z.string().length(2).describe('2-letter ISO country code (e.g., PH, SG, US)'),
      lang: z.string().optional().describe('Optional language code (e.g., en, zh, es). Defaults to en'),
    },
    async (input) => jsonResult(await client.register({
      type: input.type,
      countryCode: input.countryCode,
      lang: input.lang,
    })),
  );

  server.tool(
    'agent_get_me',
    'Get current agent profile details including ID, type, status, and metadata. Requires authentication with agent API key.',
    {},
    async () => jsonResult(await client.getMe()),
  );

  server.tool(
    'agent_update_me',
    'Update agent metadata such as language, owner email, or Telegram ID. Requires authentication. All fields are optional.',
    {
      lang: z.string().optional().describe('Language preference (e.g., en, zh, es)'),
      ownerEmail: z.string().email().optional().describe('Email address of the agent owner'),
      ownerTelegramId: z.string().optional().describe('Telegram user ID of the agent owner'),
    },
    async (input) => jsonResult(await client.updateMe(input)),
  );

  server.tool(
    'agent_update_candidate',
    'Update candidate job search profile including salary expectations, work preferences, resume, and intent. Requires CANDIDATE agent authentication. Salary values are in smallest currency unit (USD cents, JPY yen).',
    {
      headline: z.string().optional().describe('Professional headline or tagline'),
      displayName: z.string().optional().describe('Display name for public profile'),
      anonymous: z.boolean().optional().describe('Whether to show profile anonymously'),
      isPublic: z.boolean().optional().describe('Whether profile is publicly visible'),
      timezone: z.string().optional().describe('Timezone (e.g., Asia/Manila, America/New_York)'),
      preferredCurrency: z.string().length(3).optional().describe('3-letter currency code (USD, PHP, EUR)'),
      salaryMin: z.number().int().positive().optional().describe('Minimum salary in smallest currency unit (cents for USD)'),
      salaryMax: z.number().int().positive().optional().describe('Maximum salary in smallest currency unit (cents for USD)'),
      workArrangementPref: z.array(z.enum(['ON_SITE', 'HYBRID', 'FULL_REMOTE', 'REMOTE_FRIENDLY'])).optional().describe('Preferred work arrangements'),
      remoteCountries: z.array(z.string().length(2)).optional().describe('Countries willing to work remotely from (2-letter codes)'),
      resumeJson: z.record(z.unknown()).optional().describe('Resume data in JSON format'),
      intentJson: z.object({
        skills: z.array(z.string()).optional().describe('Skill keywords'),
        desiredRoles: z.array(z.string()).optional().describe('Target job titles'),
        industries: z.array(z.string()).optional().describe('Target industries'),
        experienceLevel: z.enum(['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).optional().describe('Experience level'),
      }).optional().describe('Job search intent and preferences'),
    },
    async (input) => jsonResult(await client.updateCandidate(input)),
  );

  server.tool(
    'agent_heartbeat',
    'Send heartbeat to update last active timestamp and receive notifications. Requires authentication. Use periodically to keep agent status active.',
    {},
    async () => jsonResult(await client.heartbeat()),
  );

  server.tool(
    'agent_delete',
    'Permanently delete the agent and all associated data. Requires authentication. This action is irreversible.',
    {},
    async () => jsonResult(await client.deleteMe()),
  );
}
