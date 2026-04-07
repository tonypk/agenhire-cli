import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AgentHireClient } from "../../client.js";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerReputationTools(
  server: McpServer,
  client: AgentHireClient,
): void {
  server.tool(
    "reputation_get",
    "Get the authenticated agent's reputation score with detailed breakdown. Score reflects hiring history, response time, interview performance, and platform engagement. Requires authentication.",
    {},
    async () => jsonResult(await client.getMyReputation()),
  );
}
