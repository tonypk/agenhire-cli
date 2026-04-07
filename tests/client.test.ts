import { describe, it, expect, beforeEach, vi } from "vitest";
import { AgentHireClient } from "../src/client.js";
import { AgentHireError } from "../src/errors.js";
import type { ApiResponse, Agent, Job, Application } from "../src/types.js";

describe("AgentHireClient", () => {
  let client: AgentHireClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    client = new AgentHireClient({
      baseUrl: "https://test.agenhire.com",
      apiKey: "test-api-key-123",
    });
  });

  it("should send Authorization header for authenticated endpoints", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: { id: "agent-1", type: "CANDIDATE" },
      }),
    });

    await client.getMe();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key-123",
        }),
      }),
    );
  });

  it("should NOT send Authorization header for public endpoints", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: { id: "reg-1", apiKey: "new-key", type: "CANDIDATE" },
      }),
    });

    await client.register({
      type: "CANDIDATE",
      countryCode: "PH",
      ownerEmail: "test@example.com",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/register",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      }),
    );
  });

  it("should throw AgentHireError on API errors", async () => {
    mockFetch.mockResolvedValue({
      status: 400,
      json: async () => ({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid input" },
      }),
    });

    await expect(client.getMe()).rejects.toThrow(AgentHireError);
    await expect(client.getMe()).rejects.toThrow("Invalid input");
  });

  it("should register() send POST to correct path", async () => {
    mockFetch.mockResolvedValue({
      status: 201,
      json: async () => ({
        success: true,
        data: { id: "agent-1", apiKey: "key-123", type: "CANDIDATE" },
      }),
    });

    const result = await client.register({
      type: "CANDIDATE",
      countryCode: "PH",
      ownerEmail: "test@example.com",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/register",
      expect.objectContaining({ method: "POST" }),
    );
    expect(result.id).toBe("agent-1");
    expect(result.apiKey).toBe("key-123");
  });

  it("should getMe() return agent", async () => {
    const mockAgent: Agent = {
      id: "agent-1",
      type: "CANDIDATE",
      lang: "en",
      countryCode: "PH",
      status: "ACTIVE",
      createdAt: "2026-04-01T00:00:00Z",
      updatedAt: "2026-04-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockAgent }),
    });

    const result = await client.getMe();

    expect(result).toEqual(mockAgent);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/me",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("should updateCandidate() send PATCH with body", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: null }),
    });

    await client.updateCandidate({
      headline: "Full-stack Developer",
      salaryMin: 50000,
      salaryMax: 80000,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/me/candidate",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          headline: "Full-stack Developer",
          salaryMin: 50000,
          salaryMax: 80000,
        }),
      }),
    );
  });

  it("should listMyJobs() return paginated result", async () => {
    const mockJobs: Job[] = [
      {
        id: "job-1",
        employerId: "emp-1",
        title: "Backend Engineer",
        slug: "backend-engineer-1",
        description: {},
        workArrangement: "FULL_REMOTE",
        salaryMin: 60000,
        salaryMax: 90000,
        currency: "USD",
        countryCode: "US",
        remoteCountriesAllowed: [],
        asyncFriendly: true,
        lang: "en",
        status: "ACTIVE",
        createdAt: "2026-04-01T00:00:00Z",
        updatedAt: "2026-04-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: mockJobs,
        meta: { total: 1, page: 1, limit: 10 },
      }),
    });

    const result = await client.listMyJobs({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockJobs);
    expect(result.meta.total).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/jobs?page=1&limit=10"),
      expect.anything(),
    );
  });

  it("should activateJob() send POST", async () => {
    const mockJob: Job = {
      id: "job-1",
      employerId: "emp-1",
      title: "Backend Engineer",
      slug: "backend-engineer-1",
      description: {},
      workArrangement: "FULL_REMOTE",
      salaryMin: 60000,
      salaryMax: 90000,
      currency: "USD",
      countryCode: "US",
      remoteCountriesAllowed: [],
      asyncFriendly: true,
      lang: "en",
      status: "ACTIVE",
      createdAt: "2026-04-01T00:00:00Z",
      updatedAt: "2026-04-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockJob }),
    });

    const result = await client.activateJob("job-1");

    expect(result.status).toBe("ACTIVE");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/jobs/job-1/activate",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should apply() send POST with jobId in body", async () => {
    const mockApplication: Application = {
      id: "app-1",
      candidateId: "cand-1",
      jobId: "job-1",
      status: "PENDING",
      createdAt: "2026-04-01T00:00:00Z",
      updatedAt: "2026-04-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 201,
      json: async () => ({ success: true, data: mockApplication }),
    });

    const result = await client.apply("job-1");

    expect(result.jobId).toBe("job-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/applications",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ jobId: "job-1" }),
      }),
    );
  });

  it("should listPublicJobs() work without auth", async () => {
    const mockJobs: Job[] = [
      {
        id: "job-public-1",
        employerId: "emp-1",
        title: "Public Job",
        slug: "public-job-1",
        description: {},
        workArrangement: "FULL_REMOTE",
        salaryMin: 50000,
        salaryMax: 70000,
        currency: "USD",
        countryCode: "US",
        remoteCountriesAllowed: [],
        asyncFriendly: true,
        lang: "en",
        status: "ACTIVE",
        createdAt: "2026-04-01T00:00:00Z",
        updatedAt: "2026-04-01T00:00:00Z",
      },
    ];

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: mockJobs,
        meta: { total: 1, page: 1, limit: 10 },
      }),
    });

    const result = await client.listPublicJobs({ page: 1 });

    expect(result.data).toEqual(mockJobs);
    // Public endpoints should still work (no auth header required)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/public/jobs"),
      expect.anything(),
    );
  });

  it("should handle query parameters correctly", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      }),
    });

    await client.listMyJobs({
      status: "ACTIVE",
      workArrangement: "FULL_REMOTE",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=ACTIVE"),
      expect.anything(),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("workArrangement=FULL_REMOTE"),
      expect.anything(),
    );
  });

  it("should throw error when success is false", async () => {
    mockFetch.mockResolvedValue({
      status: 404,
      json: async () => ({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found" },
      }),
    });

    await expect(client.getJob("nonexistent-id")).rejects.toThrow(
      "Resource not found",
    );
  });

  it("should handle heartbeat correctly", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          status: "ACTIVE",
          lastActive: "2026-04-07T00:00:00Z",
          notifications: [],
        },
      }),
    });

    const result = await client.heartbeat();

    expect(result.status).toBe("ACTIVE");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/heartbeat",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should handle employer methods correctly", async () => {
    const mockEmployer = {
      id: "emp-1",
      agentId: "agent-1",
      companyName: "Test Corp",
      countryCode: "US",
      acceptedCurrencies: ["USD"],
      verificationTier: "BASIC",
      reputationScore: 100,
      createdAt: "2026-04-01T00:00:00Z",
      updatedAt: "2026-04-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockEmployer }),
    });

    const result = await client.createEmployerProfile({
      companyName: "Test Corp",
      countryCode: "US",
    });

    expect(result.companyName).toBe("Test Corp");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/employers/profile",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("should handle offer methods correctly", async () => {
    const mockOffer = {
      id: "offer-1",
      applicationId: "app-1",
      salary: 75000,
      currency: "USD",
      workArrangement: "FULL_REMOTE",
      status: "PENDING",
      createdAt: "2026-04-01T00:00:00Z",
      updatedAt: "2026-04-01T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockOffer }),
    });

    const result = await client.respondToOffer("offer-1", "ACCEPT");

    expect(result.id).toBe("offer-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/offers/offer-1/respond",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ action: "ACCEPT" }),
      }),
    );
  });

  // Feed methods
  it("should listFeedEvents() send GET with query params", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: "event-1",
            type: "JOB_MATCH",
            title: "New match",
            summary: "A job matches your profile",
            read: false,
            createdAt: "2026-04-07T00:00:00Z",
          },
        ],
      }),
    });

    const result = await client.listFeedEvents({ unreadOnly: true, limit: 10 });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("event-1");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/agents/feed"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("should markFeedRead() send PATCH to correct path", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: null }),
    });

    await client.markFeedRead("event-1");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/feed/event-1/read",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("should getUnreadCount() return count", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: { count: 5 } }),
    });

    const result = await client.getUnreadCount();

    expect(result.count).toBe(5);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/agents/feed/unread-count",
      expect.objectContaining({ method: "GET" }),
    );
  });

  // Match Score
  it("should getMatchScore() send GET with jobId", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: {
          jobId: "job-1",
          score: 85,
          breakdown: {
            skills: 90,
            experience: 80,
            salary: 85,
            location: 90,
            culture: 80,
          },
          recommendation: "Strong match",
        },
      }),
    });

    const result = await client.getMatchScore("job-1");

    expect(result.score).toBe(85);
    expect(result.breakdown.skills).toBe(90);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/match/job/job-1/score",
      expect.objectContaining({ method: "GET" }),
    );
  });

  // Conversation methods
  it("should sendMessage() send POST with body", async () => {
    const mockMessage = {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "agent-1",
      intent: "QUESTION",
      content: "When is the start date?",
      createdAt: "2026-04-07T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 201,
      json: async () => ({ success: true, data: mockMessage }),
    });

    const result = await client.sendMessage("app-1", {
      intent: "QUESTION",
      content: "When is the start date?",
    });

    expect(result.id).toBe("msg-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/conversations/app-1/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          intent: "QUESTION",
          content: "When is the start date?",
        }),
      }),
    );
  });

  it("should listMessages() send GET with applicationId", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "agent-1",
            intent: "GENERAL",
            content: "Hello",
            createdAt: "2026-04-07T00:00:00Z",
          },
        ],
      }),
    });

    const result = await client.listMessages("app-1", { limit: 10 });

    expect(result).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/conversations/app-1/messages"),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("should listConversations() return paginated result", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({
        success: true,
        data: [
          {
            id: "conv-1",
            applicationId: "app-1",
            participants: ["agent-1", "agent-2"],
            status: "ACTIVE",
            createdAt: "2026-04-07T00:00:00Z",
            updatedAt: "2026-04-07T00:00:00Z",
          },
        ],
        meta: { total: 1, page: 1, limit: 10 },
      }),
    });

    const result = await client.listConversations({ status: "ACTIVE" });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/conversations"),
      expect.anything(),
    );
  });

  it("should handle approval methods without auth", async () => {
    const mockApproval = {
      id: "approval-1",
      type: "DEPOSIT_CONFIRMATION",
      status: "PENDING",
      context: {},
      expiresAt: "2026-04-08T00:00:00Z",
      createdAt: "2026-04-07T00:00:00Z",
    };

    mockFetch.mockResolvedValue({
      status: 200,
      json: async () => ({ success: true, data: mockApproval }),
    });

    const result = await client.getApproval("token-123");

    expect(result.id).toBe("approval-1");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://test.agenhire.com/api/v1/approvals/token-123",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      }),
    );
  });
});
