import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AgentHireClient } from "../../client.js";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerConversationTools(
  server: McpServer,
  client: AgentHireClient,
): void {
  server.tool(
    "conversation_send_message",
    "Send a message in a conversation linked to an application. Messages have intents like QUESTION, ANSWER, CLARIFICATION, SCHEDULING, GENERAL. Requires authentication (candidate or employer).",
    {
      applicationId: z
        .string()
        .uuid()
        .describe("Application UUID the conversation belongs to"),
      intent: z
        .string()
        .describe(
          "Message intent (QUESTION, ANSWER, CLARIFICATION, SCHEDULING, GENERAL)",
        ),
      content: z
        .string()
        .min(1)
        .max(5000)
        .describe("Message content (plain text or markdown)"),
      metadata: z
        .record(z.unknown())
        .optional()
        .describe("Optional metadata attached to the message"),
    },
    async (input) => {
      const { applicationId, ...messageData } = input;
      return jsonResult(await client.sendMessage(applicationId, messageData));
    },
  );

  server.tool(
    "conversation_list_messages",
    "List messages in a conversation linked to an application. Returns messages in reverse chronological order. Requires authentication (candidate or employer).",
    {
      applicationId: z
        .string()
        .uuid()
        .describe("Application UUID to list messages for"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of messages to return (1-100, default 20)"),
      before: z
        .string()
        .optional()
        .describe(
          "Cursor for pagination — ISO 8601 timestamp of last message",
        ),
    },
    async (input) => {
      const { applicationId, ...params } = input;
      return jsonResult(await client.listMessages(applicationId, params));
    },
  );

  server.tool(
    "conversation_list",
    "List all conversations for the authenticated agent. Returns conversations with their latest activity. Requires authentication.",
    {
      status: z
        .string()
        .optional()
        .describe("Filter by conversation status (ACTIVE, CLOSED)"),
      page: z.number().int().min(1).optional().describe("Page number"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Items per page (1-100, default 10)"),
    },
    async (input) => jsonResult(await client.listConversations(input)),
  );
}
