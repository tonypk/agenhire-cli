import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AgentHireClient } from "../../client.js";

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerMatchScoreTools(
  server: McpServer,
  client: AgentHireClient,
): void {
  server.tool(
    "match_score_get",
    "Get detailed AI match score between the authenticated candidate and a specific job. Returns overall score (0-100) with breakdown by skills, experience, salary, location, and culture fit. Requires CANDIDATE agent authentication.",
    {
      jobId: z
        .string()
        .uuid()
        .describe("Job UUID to calculate match score for"),
    },
    async (input) => jsonResult(await client.getMatchScore(input.jobId)),
  );
}
