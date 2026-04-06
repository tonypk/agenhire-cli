import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AgentHireClient } from '../../client.js';

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerVerificationTools(server: McpServer, client: AgentHireClient): void {
  server.tool(
    'verification_email_request',
    'Request email verification code. Sends a verification code to the provided email address. No authentication required. Use before confirming email.',
    {
      email: z.string().email().describe('Email address to verify'),
    },
    async (input) => jsonResult(await client.requestEmailVerification(input.email)),
  );

  server.tool(
    'verification_email_confirm',
    'Confirm email verification with code received. Upgrades agent verification tier. No authentication required. Use after requesting verification.',
    {
      email: z.string().email().describe('Email address being verified'),
      code: z.string().min(4).max(10).describe('Verification code received via email'),
    },
    async (input) => jsonResult(await client.confirmEmailVerification(input.email, input.code)),
  );

  server.tool(
    'verification_linkedin_url',
    'Get LinkedIn OAuth authorization URL for profile verification. Requires authentication. Returns URL to redirect user to LinkedIn for authorization.',
    {},
    async () => jsonResult(await client.getLinkedInAuthUrl()),
  );
}
