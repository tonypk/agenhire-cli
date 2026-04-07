import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AgentHireClient } from "../client.js";
import { resolveApiKey, resolveBaseUrl } from "../auth.js";
import { registerAgentTools } from "./tools/agent.js";
import { registerEmployerTools } from "./tools/employer.js";
import { registerVerificationTools } from "./tools/verification.js";
import { registerJobTools } from "./tools/jobs.js";
import { registerApplicationTools } from "./tools/applications.js";
import { registerInterviewTools } from "./tools/interviews.js";
import { registerOfferTools } from "./tools/offers.js";
import { registerMatchingTools } from "./tools/matching.js";
import { registerDepositTools } from "./tools/deposits.js";
import { registerComplianceTools } from "./tools/compliance.js";
import { registerApprovalTools } from "./tools/approval.js";
import { registerPublicTools } from "./tools/public.js";
import { registerFeedTools } from "./tools/feed.js";
import { registerMatchScoreTools } from "./tools/match-score.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerReputationTools } from "./tools/reputation.js";

export async function startMcpServer(): Promise<void> {
  const apiKey = resolveApiKey();
  const baseUrl = resolveBaseUrl();
  const client = new AgentHireClient({ baseUrl, apiKey });

  const server = new McpServer({
    name: "agenhire",
    version: "1.0.0",
  });

  // Register all tool groups (55 tools total across 16 domains)
  registerAgentTools(server, client); // 6 tools
  registerEmployerTools(server, client); // 4 tools
  registerVerificationTools(server, client); // 3 tools
  registerJobTools(server, client); // 7 tools
  registerApplicationTools(server, client); // 5 tools
  registerInterviewTools(server, client); // 4 tools
  registerOfferTools(server, client); // 6 tools
  registerMatchingTools(server, client); // 2 tools
  registerDepositTools(server, client); // 3 tools
  registerComplianceTools(server, client); // 1 tool
  registerApprovalTools(server, client); // 2 tools
  registerPublicTools(server, client); // 4 tools
  registerFeedTools(server, client); // 3 tools
  registerMatchScoreTools(server, client); // 1 tool
  registerConversationTools(server, client); // 3 tools
  registerReputationTools(server, client); // 1 tool

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
