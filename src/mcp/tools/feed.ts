import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AgentHireClient } from "../../client.js";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerFeedTools(
  server: McpServer,
  client: AgentHireClient,
): void {
  server.tool(
    "feed_list",
    "List activity feed events for the authenticated agent. Shows job matches, application updates, interview invitations, and other notifications. Use types filter for specific event categories.",
    {
      types: z
        .string()
        .optional()
        .describe(
          "Comma-separated event types to filter (e.g. JOB_MATCH,APPLICATION_UPDATE)",
        ),
      unreadOnly: z
        .boolean()
        .optional()
        .describe("Only return unread events (default false)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of events to return (1-100, default 20)"),
      before: z
        .string()
        .optional()
        .describe("Cursor for pagination — ISO 8601 timestamp of last event"),
    },
    async (input) => jsonResult(await client.listFeedEvents(input)),
  );

  server.tool(
    "feed_mark_read",
    "Mark a specific feed event as read. Requires authentication.",
    {
      eventId: z.string().uuid().describe("Feed event UUID to mark as read"),
    },
    async (input) => jsonResult(await client.markFeedRead(input.eventId)),
  );

  server.tool(
    "feed_unread_count",
    "Get the total count of unread feed events. Useful for badge/notification indicators. Requires authentication.",
    {},
    async () => jsonResult(await client.getUnreadCount()),
  );
}
