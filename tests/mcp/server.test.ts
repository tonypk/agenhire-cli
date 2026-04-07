import { describe, it, expect, vi } from "vitest";

describe("MCP tool registration", () => {
  it("registers agent tools with correct names", async () => {
    const { registerAgentTools } = await import("../../src/mcp/tools/agent.js");
    const mockServer = { tool: vi.fn() };
    registerAgentTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("agent_register");
    expect(toolNames).toContain("agent_get_me");
    expect(toolNames).toContain("agent_update_me");
    expect(toolNames).toContain("agent_update_candidate");
    expect(toolNames).toContain("agent_heartbeat");
    expect(toolNames).toContain("agent_delete");
  });

  it("registers employer tools with correct names", async () => {
    const { registerEmployerTools } =
      await import("../../src/mcp/tools/employer.js");
    const mockServer = { tool: vi.fn() };
    registerEmployerTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("employer_create_profile");
    expect(toolNames).toContain("employer_get_profile");
    expect(toolNames).toContain("employer_update_profile");
    expect(toolNames).toContain("employer_sandbox_status");
  });

  it("registers verification tools with correct names", async () => {
    const { registerVerificationTools } =
      await import("../../src/mcp/tools/verification.js");
    const mockServer = { tool: vi.fn() };
    registerVerificationTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("verification_email_request");
    expect(toolNames).toContain("verification_email_confirm");
    expect(toolNames).toContain("verification_linkedin_url");
  });

  it("registers job tools with correct names", async () => {
    const { registerJobTools } = await import("../../src/mcp/tools/jobs.js");
    const mockServer = { tool: vi.fn() };
    registerJobTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("jobs_create");
    expect(toolNames).toContain("jobs_list_mine");
    expect(toolNames).toContain("jobs_get");
    expect(toolNames).toContain("jobs_update");
    expect(toolNames).toContain("jobs_activate");
    expect(toolNames).toContain("jobs_pause");
    expect(toolNames).toContain("jobs_close");
  });

  it("registers application tools with correct names", async () => {
    const { registerApplicationTools } =
      await import("../../src/mcp/tools/applications.js");
    const mockServer = { tool: vi.fn() };
    registerApplicationTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("applications_apply");
    expect(toolNames).toContain("applications_list_mine");
    expect(toolNames).toContain("applications_get");
    expect(toolNames).toContain("applications_update_status");
    expect(toolNames).toContain("applications_list_for_job");
  });

  it("registers interview tools with correct names", async () => {
    const { registerInterviewTools } =
      await import("../../src/mcp/tools/interviews.js");
    const mockServer = { tool: vi.fn() };
    registerInterviewTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("interviews_create");
    expect(toolNames).toContain("interviews_get_pending");
    expect(toolNames).toContain("interviews_submit");
    expect(toolNames).toContain("interviews_score");
  });

  it("registers offer tools with correct names", async () => {
    const { registerOfferTools } =
      await import("../../src/mcp/tools/offers.js");
    const mockServer = { tool: vi.fn() };
    registerOfferTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("offers_create");
    expect(toolNames).toContain("offers_send");
    expect(toolNames).toContain("offers_respond");
    expect(toolNames).toContain("offers_withdraw");
    expect(toolNames).toContain("offers_negotiate");
    expect(toolNames).toContain("offers_list_negotiations");
  });

  it("registers matching tools with correct names", async () => {
    const { registerMatchingTools } =
      await import("../../src/mcp/tools/matching.js");
    const mockServer = { tool: vi.fn() };
    registerMatchingTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("matching_jobs");
    expect(toolNames).toContain("matching_candidates");
  });

  it("registers deposit tools with correct names", async () => {
    const { registerDepositTools } =
      await import("../../src/mcp/tools/deposits.js");
    const mockServer = { tool: vi.fn() };
    registerDepositTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("deposits_create");
    expect(toolNames).toContain("deposits_list");
    expect(toolNames).toContain("deposits_get");
  });

  it("registers compliance tools with correct names", async () => {
    const { registerComplianceTools } =
      await import("../../src/mcp/tools/compliance.js");
    const mockServer = { tool: vi.fn() };
    registerComplianceTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("compliance_tips");
  });

  it("registers approval tools with correct names", async () => {
    const { registerApprovalTools } =
      await import("../../src/mcp/tools/approval.js");
    const mockServer = { tool: vi.fn() };
    registerApprovalTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("approval_get");
    expect(toolNames).toContain("approval_resolve");
  });

  it("registers public tools with correct names", async () => {
    const { registerPublicTools } =
      await import("../../src/mcp/tools/public.js");
    const mockServer = { tool: vi.fn() };
    registerPublicTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("public_jobs_list");
    expect(toolNames).toContain("public_jobs_get");
    expect(toolNames).toContain("public_talent_list");
    expect(toolNames).toContain("public_talent_get");
  });

  it("registers feed tools with correct names", async () => {
    const { registerFeedTools } = await import("../../src/mcp/tools/feed.js");
    const mockServer = { tool: vi.fn() };
    registerFeedTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("feed_list");
    expect(toolNames).toContain("feed_mark_read");
    expect(toolNames).toContain("feed_unread_count");
  });

  it("registers match score tools with correct names", async () => {
    const { registerMatchScoreTools } =
      await import("../../src/mcp/tools/match-score.js");
    const mockServer = { tool: vi.fn() };
    registerMatchScoreTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("match_score_get");
  });

  it("registers conversation tools with correct names", async () => {
    const { registerConversationTools } =
      await import("../../src/mcp/tools/conversations.js");
    const mockServer = { tool: vi.fn() };
    registerConversationTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("conversation_send_message");
    expect(toolNames).toContain("conversation_list_messages");
    expect(toolNames).toContain("conversation_list");
  });

  it("registers reputation tools with correct names", async () => {
    const { registerReputationTools } =
      await import("../../src/mcp/tools/reputation.js");
    const mockServer = { tool: vi.fn() };
    registerReputationTools(mockServer as any, {} as any);
    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    expect(toolNames).toContain("reputation_get");
  });

  it("registers at least 49 tools total", async () => {
    const { registerAgentTools } = await import("../../src/mcp/tools/agent.js");
    const { registerEmployerTools } =
      await import("../../src/mcp/tools/employer.js");
    const { registerVerificationTools } =
      await import("../../src/mcp/tools/verification.js");
    const { registerJobTools } = await import("../../src/mcp/tools/jobs.js");
    const { registerApplicationTools } =
      await import("../../src/mcp/tools/applications.js");
    const { registerInterviewTools } =
      await import("../../src/mcp/tools/interviews.js");
    const { registerOfferTools } =
      await import("../../src/mcp/tools/offers.js");
    const { registerMatchingTools } =
      await import("../../src/mcp/tools/matching.js");
    const { registerDepositTools } =
      await import("../../src/mcp/tools/deposits.js");
    const { registerComplianceTools } =
      await import("../../src/mcp/tools/compliance.js");
    const { registerApprovalTools } =
      await import("../../src/mcp/tools/approval.js");
    const { registerPublicTools } =
      await import("../../src/mcp/tools/public.js");
    const { registerFeedTools } = await import("../../src/mcp/tools/feed.js");
    const { registerMatchScoreTools } =
      await import("../../src/mcp/tools/match-score.js");
    const { registerConversationTools } =
      await import("../../src/mcp/tools/conversations.js");
    const { registerReputationTools } =
      await import("../../src/mcp/tools/reputation.js");

    const mockServer = { tool: vi.fn() };
    const client = {} as any;

    registerAgentTools(mockServer as any, client);
    registerEmployerTools(mockServer as any, client);
    registerVerificationTools(mockServer as any, client);
    registerJobTools(mockServer as any, client);
    registerApplicationTools(mockServer as any, client);
    registerInterviewTools(mockServer as any, client);
    registerOfferTools(mockServer as any, client);
    registerMatchingTools(mockServer as any, client);
    registerDepositTools(mockServer as any, client);
    registerComplianceTools(mockServer as any, client);
    registerApprovalTools(mockServer as any, client);
    registerPublicTools(mockServer as any, client);
    registerFeedTools(mockServer as any, client);
    registerMatchScoreTools(mockServer as any, client);
    registerConversationTools(mockServer as any, client);
    registerReputationTools(mockServer as any, client);

    expect(mockServer.tool.mock.calls.length).toBeGreaterThanOrEqual(49);
  });

  it("all tool names follow snake_case with domain prefix pattern", async () => {
    const { registerAgentTools } = await import("../../src/mcp/tools/agent.js");
    const { registerEmployerTools } =
      await import("../../src/mcp/tools/employer.js");
    const { registerVerificationTools } =
      await import("../../src/mcp/tools/verification.js");
    const { registerJobTools } = await import("../../src/mcp/tools/jobs.js");
    const { registerApplicationTools } =
      await import("../../src/mcp/tools/applications.js");
    const { registerInterviewTools } =
      await import("../../src/mcp/tools/interviews.js");
    const { registerOfferTools } =
      await import("../../src/mcp/tools/offers.js");
    const { registerMatchingTools } =
      await import("../../src/mcp/tools/matching.js");
    const { registerDepositTools } =
      await import("../../src/mcp/tools/deposits.js");
    const { registerComplianceTools } =
      await import("../../src/mcp/tools/compliance.js");
    const { registerApprovalTools } =
      await import("../../src/mcp/tools/approval.js");
    const { registerPublicTools } =
      await import("../../src/mcp/tools/public.js");
    const { registerFeedTools } = await import("../../src/mcp/tools/feed.js");
    const { registerMatchScoreTools } =
      await import("../../src/mcp/tools/match-score.js");
    const { registerConversationTools } =
      await import("../../src/mcp/tools/conversations.js");
    const { registerReputationTools } =
      await import("../../src/mcp/tools/reputation.js");

    const mockServer = { tool: vi.fn() };
    const client = {} as any;

    registerAgentTools(mockServer as any, client);
    registerEmployerTools(mockServer as any, client);
    registerVerificationTools(mockServer as any, client);
    registerJobTools(mockServer as any, client);
    registerApplicationTools(mockServer as any, client);
    registerInterviewTools(mockServer as any, client);
    registerOfferTools(mockServer as any, client);
    registerMatchingTools(mockServer as any, client);
    registerDepositTools(mockServer as any, client);
    registerComplianceTools(mockServer as any, client);
    registerApprovalTools(mockServer as any, client);
    registerPublicTools(mockServer as any, client);
    registerFeedTools(mockServer as any, client);
    registerMatchScoreTools(mockServer as any, client);
    registerConversationTools(mockServer as any, client);
    registerReputationTools(mockServer as any, client);

    const toolNames = mockServer.tool.mock.calls.map((c: any[]) => c[0]);
    const pattern = /^[a-z]+_[a-z_]+$/;

    for (const name of toolNames) {
      expect(name).toMatch(pattern);
    }
  });
});
