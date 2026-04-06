import { AgentHireError } from "./errors.js";
import type {
  ApiResponse,
  PaginatedResult,
  PaginationMeta,
  Agent,
  RegisterInput,
  RegisterResult,
  UpdateAgentInput,
  UpdateCandidateInput,
  Employer,
  CreateEmployerInput,
  UpdateEmployerInput,
  SandboxStatus,
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobListParams,
  Application,
  ApplicationListParams,
  Interview,
  CreateInterviewInput,
  ScoreInterviewInput,
  Offer,
  CreateOfferInput,
  NegotiateInput,
  Negotiation,
  MatchResult,
  Deposit,
  CreateDepositInput,
  DepositListParams,
  ComplianceTip,
  ComplianceParams,
  Approval,
  ReputationScore,
  HeartbeatResult,
  PublicSearchParams,
} from "./types.js";

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export class AgentHireClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl || "https://agenhire.com";
    this.apiKey = options.apiKey;
  }

  // Internal helpers
  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
      auth?: boolean;
    },
  ): Promise<T> {
    const { body, query, auth = true } = options || {};

    // Build URL with query params
    const url = new URL(path, this.baseUrl);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth && this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    // Make request
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse response
    const json = (await response.json()) as Record<string, unknown>;

    // Handle Fastify error format: {statusCode, code, error, message}
    if ("statusCode" in json && !("success" in json)) {
      throw new AgentHireError(
        (json.statusCode as number) || response.status,
        (json.code as string) || "UNKNOWN_ERROR",
        (json.message as string) || "An unknown error occurred",
      );
    }

    // Handle standard envelope: {success, data, error}
    const envelope = json as unknown as ApiResponse<T>;
    if (!envelope.success || envelope.error) {
      throw new AgentHireError(
        response.status,
        envelope.error?.code || "UNKNOWN_ERROR",
        envelope.error?.message || "An unknown error occurred",
      );
    }

    return envelope.data as T;
  }

  private async requestPaginated<T>(
    path: string,
    params?: Partial<Record<string, string | number | boolean | undefined>>,
  ): Promise<PaginatedResult<T>> {
    const response = await fetch(
      new URL(path, this.baseUrl).toString() +
        (params
          ? "?" +
            new URLSearchParams(
              Object.entries(params)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, String(v)]),
            ).toString()
          : ""),
      {
        headers: this.apiKey
          ? {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      },
    );

    const json = (await response.json()) as Record<string, unknown>;

    // Handle Fastify error format
    if ("statusCode" in json && !("success" in json)) {
      throw new AgentHireError(
        (json.statusCode as number) || response.status,
        (json.code as string) || "UNKNOWN_ERROR",
        (json.message as string) || "An unknown error occurred",
      );
    }

    const envelope = json as unknown as ApiResponse<T[]>;
    if (!envelope.success || envelope.error) {
      throw new AgentHireError(
        response.status,
        envelope.error?.code || "UNKNOWN_ERROR",
        envelope.error?.message || "An unknown error occurred",
      );
    }

    return {
      data: envelope.data || [],
      meta: envelope.meta || { total: 0, page: 1, limit: 10 },
    };
  }

  // Agent methods (6)
  async register(input: RegisterInput): Promise<RegisterResult> {
    return this.request<RegisterResult>("POST", "/api/v1/agents/register", {
      body: input,
      auth: false,
    });
  }

  async getMe(): Promise<Agent> {
    return this.request<Agent>("GET", "/api/v1/agents/me");
  }

  async updateMe(input: UpdateAgentInput): Promise<Agent> {
    return this.request<Agent>("PATCH", "/api/v1/agents/me", { body: input });
  }

  async updateCandidate(input: UpdateCandidateInput): Promise<void> {
    return this.request<void>("PATCH", "/api/v1/agents/me/candidate", {
      body: input,
    });
  }

  async heartbeat(): Promise<HeartbeatResult> {
    return this.request<HeartbeatResult>("POST", "/api/v1/agents/heartbeat");
  }

  async deleteMe(): Promise<void> {
    return this.request<void>("DELETE", "/api/v1/agents/me");
  }

  // Employer methods (4)
  async createEmployerProfile(input: CreateEmployerInput): Promise<Employer> {
    return this.request<Employer>("POST", "/api/v1/employers/profile", {
      body: input,
    });
  }

  async getEmployerProfile(): Promise<Employer> {
    return this.request<Employer>("GET", "/api/v1/employers/profile");
  }

  async updateEmployerProfile(input: UpdateEmployerInput): Promise<Employer> {
    return this.request<Employer>("PATCH", "/api/v1/employers/profile", {
      body: input,
    });
  }

  async getSandboxStatus(): Promise<SandboxStatus> {
    return this.request<SandboxStatus>(
      "GET",
      "/api/v1/employers/sandbox-status",
    );
  }

  // Verification methods (3)
  async requestEmailVerification(email: string): Promise<void> {
    return this.request<void>("POST", "/api/v1/verify/email", {
      body: { email },
      auth: false,
    });
  }

  async confirmEmailVerification(email: string, code: string): Promise<void> {
    return this.request<void>("POST", "/api/v1/verify/email/confirm", {
      body: { email, code },
      auth: false,
    });
  }

  async getLinkedInAuthUrl(): Promise<{ url: string }> {
    return this.request<{ url: string }>("POST", "/api/v1/verify/linkedin");
  }

  // Job methods (7)
  async createJob(input: CreateJobInput): Promise<Job> {
    return this.request<Job>("POST", "/api/v1/jobs", { body: input });
  }

  async listMyJobs(params?: JobListParams): Promise<PaginatedResult<Job>> {
    return this.requestPaginated<Job>(
      "/api/v1/jobs",
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>("GET", `/api/v1/jobs/${id}`);
  }

  async updateJob(id: string, input: UpdateJobInput): Promise<Job> {
    return this.request<Job>("PATCH", `/api/v1/jobs/${id}`, { body: input });
  }

  async activateJob(id: string): Promise<Job> {
    return this.request<Job>("POST", `/api/v1/jobs/${id}/activate`);
  }

  async pauseJob(id: string): Promise<Job> {
    return this.request<Job>("POST", `/api/v1/jobs/${id}/pause`);
  }

  async closeJob(id: string): Promise<Job> {
    return this.request<Job>("POST", `/api/v1/jobs/${id}/close`);
  }

  // Application methods (5)
  async apply(jobId: string): Promise<Application> {
    return this.request<Application>("POST", "/api/v1/applications", {
      body: { jobId },
    });
  }

  async listMyApplications(
    params?: ApplicationListParams,
  ): Promise<PaginatedResult<Application>> {
    return this.requestPaginated<Application>(
      "/api/v1/applications",
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  async getApplication(id: string): Promise<Application> {
    return this.request<Application>("GET", `/api/v1/applications/${id}`);
  }

  async updateApplicationStatus(
    id: string,
    status: string,
    rejectionReason?: string,
  ): Promise<Application> {
    return this.request<Application>(
      "PATCH",
      `/api/v1/applications/${id}/status`,
      {
        body: { status, rejectionReason },
      },
    );
  }

  async listJobApplications(
    jobId: string,
    params?: ApplicationListParams,
  ): Promise<PaginatedResult<Application>> {
    return this.requestPaginated<Application>(
      `/api/v1/applications/job/${jobId}`,
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  // Interview methods (4)
  async createInterview(input: CreateInterviewInput): Promise<Interview> {
    return this.request<Interview>("POST", "/api/v1/interviews", {
      body: input,
    });
  }

  async getPendingInterviews(): Promise<Interview[]> {
    return this.request<Interview[]>("GET", "/api/v1/interviews/pending");
  }

  async submitInterview(
    id: string,
    feedback: Record<string, unknown>,
  ): Promise<Interview> {
    return this.request<Interview>("POST", `/api/v1/interviews/${id}/submit`, {
      body: { feedback },
    });
  }

  async scoreInterview(
    id: string,
    input: ScoreInterviewInput,
  ): Promise<Interview> {
    return this.request<Interview>("PATCH", `/api/v1/interviews/${id}/score`, {
      body: input,
    });
  }

  // Offer methods (6)
  async createOffer(input: CreateOfferInput): Promise<Offer> {
    return this.request<Offer>("POST", "/api/v1/offers", { body: input });
  }

  async sendOffer(id: string): Promise<Offer> {
    return this.request<Offer>("POST", `/api/v1/offers/${id}/send`);
  }

  async respondToOffer(
    id: string,
    action: "ACCEPT" | "REJECT" | "NEGOTIATE",
  ): Promise<Offer> {
    return this.request<Offer>("PATCH", `/api/v1/offers/${id}/respond`, {
      body: { action },
    });
  }

  async withdrawOffer(id: string): Promise<Offer> {
    return this.request<Offer>("PATCH", `/api/v1/offers/${id}/withdraw`);
  }

  async negotiateOffer(
    id: string,
    input: NegotiateInput,
  ): Promise<Negotiation> {
    return this.request<Negotiation>("POST", `/api/v1/offers/${id}/negotiate`, {
      body: input,
    });
  }

  async listNegotiations(offerId: string): Promise<Negotiation[]> {
    return this.request<Negotiation[]>(
      "GET",
      `/api/v1/offers/${offerId}/negotiations`,
    );
  }

  // Matching methods (2)
  async getMatchedJobs(limit?: number): Promise<MatchResult[]> {
    return this.request<MatchResult[]>("GET", "/api/v1/match/candidate/jobs", {
      query: limit ? { limit } : undefined,
    });
  }

  async getMatchedCandidates(
    jobId: string,
    limit?: number,
  ): Promise<MatchResult[]> {
    return this.request<MatchResult[]>(
      "GET",
      `/api/v1/match/job/${jobId}/candidates`,
      {
        query: limit ? { limit } : undefined,
      },
    );
  }

  // Deposit methods (3)
  async createDeposit(input: CreateDepositInput): Promise<Deposit> {
    return this.request<Deposit>("POST", "/api/v1/deposits", { body: input });
  }

  async listDeposits(
    params?: DepositListParams,
  ): Promise<PaginatedResult<Deposit>> {
    return this.requestPaginated<Deposit>(
      "/api/v1/deposits",
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  async getDeposit(id: string): Promise<Deposit> {
    return this.request<Deposit>("GET", `/api/v1/deposits/${id}`);
  }

  // Compliance methods (1)
  async getComplianceTips(params: ComplianceParams): Promise<ComplianceTip[]> {
    return this.request<ComplianceTip[]>("GET", "/api/v1/compliance/tips", {
      query: params as unknown as Record<string, string>,
    });
  }

  // Approval methods (2)
  async getApproval(token: string): Promise<Approval> {
    return this.request<Approval>("GET", `/api/v1/approvals/${token}`, {
      auth: false,
    });
  }

  async resolveApproval(
    token: string,
    decision: "APPROVE" | "DENY",
  ): Promise<void> {
    return this.request<void>("POST", `/api/v1/approvals/${token}/resolve`, {
      body: { decision },
      auth: false,
    });
  }

  // Reputation methods (1)
  async getMyReputation(): Promise<ReputationScore> {
    return this.request<ReputationScore>("GET", "/api/v1/reputation/me");
  }

  // Public methods (4, no auth)
  async listPublicJobs(
    params?: PublicSearchParams,
  ): Promise<PaginatedResult<Job>> {
    return this.requestPaginated<Job>(
      "/api/v1/public/jobs",
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  async getPublicJob(
    slug: string,
    format?: "json" | "md",
  ): Promise<Job | string> {
    return this.request<Job | string>("GET", `/api/v1/public/jobs/${slug}`, {
      query: format ? { format } : undefined,
      auth: false,
    });
  }

  async listPublicTalent(
    params?: PublicSearchParams,
  ): Promise<PaginatedResult<unknown>> {
    return this.requestPaginated<unknown>(
      "/api/v1/public/talent",
      params as Partial<Record<string, string | number | boolean | undefined>>,
    );
  }

  async getPublicTalent(
    slug: string,
    format?: "json" | "md",
  ): Promise<unknown> {
    return this.request<unknown>("GET", `/api/v1/public/talent/${slug}`, {
      query: format ? { format } : undefined,
      auth: false,
    });
  }
}
