// API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Agent
export interface Agent {
  id: string;
  type: 'CANDIDATE' | 'EMPLOYER';
  lang: string;
  countryCode: string;
  ownerEmail?: string;
  ownerTelegramId?: string;
  status: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  type: 'CANDIDATE' | 'EMPLOYER';
  countryCode: string;
  lang?: string;
  ownerEmail?: string;
  ownerTelegramId?: string;
}

export interface RegisterResult {
  id: string;
  apiKey: string;
  type: string;
}

export interface UpdateAgentInput {
  lang?: string;
  ownerEmail?: string;
  ownerTelegramId?: string;
}

// Candidate
export interface Candidate {
  id: string;
  agentId: string;
  headline?: string;
  displayName?: string;
  anonymous: boolean;
  isPublic: boolean;
  timezone?: string;
  preferredCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  workArrangementPref: string[];
  remoteCountries: string[];
  resumeJson?: Record<string, unknown>;
  intentJson?: IntentJson;
  profileCompleteness: number;
  reputationScore: number;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntentJson {
  skills?: string[];
  desiredRoles?: string[];
  industries?: string[];
  experienceLevel?: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
}

export interface UpdateCandidateInput {
  headline?: string;
  displayName?: string;
  anonymous?: boolean;
  isPublic?: boolean;
  timezone?: string;
  preferredCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  workArrangementPref?: string[];
  remoteCountries?: string[];
  resumeJson?: Record<string, unknown>;
  intentJson?: IntentJson;
}

// Employer
export interface Employer {
  id: string;
  agentId: string;
  companyName: string;
  countryCode: string;
  acceptedCurrencies: string[];
  verificationTier: string;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployerInput {
  companyName: string;
  countryCode: string;
  acceptedCurrencies?: string[];
}

export interface UpdateEmployerInput {
  companyName?: string;
  acceptedCurrencies?: string[];
}

// Job
export interface Job {
  id: string;
  employerId: string;
  title: string;
  slug: string;
  description: Record<string, unknown>;
  workArrangement: string;
  coreHours?: Record<string, unknown>;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  countryCode: string;
  remoteCountriesAllowed: string[];
  asyncFriendly: boolean;
  internetStipend?: number;
  coworkingBudget?: number;
  lang: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  title: string;
  description: Record<string, unknown>;
  workArrangement: 'ON_SITE' | 'HYBRID' | 'FULL_REMOTE' | 'REMOTE_FRIENDLY';
  coreHours?: Record<string, unknown>;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  countryCode: string;
  remoteCountriesAllowed?: string[];
  asyncFriendly?: boolean;
  internetStipend?: number;
  coworkingBudget?: number;
  lang?: string;
}

export interface UpdateJobInput {
  title?: string;
  description?: Record<string, unknown>;
  workArrangement?: string;
  coreHours?: Record<string, unknown>;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remoteCountriesAllowed?: string[];
  asyncFriendly?: boolean;
  internetStipend?: number;
  coworkingBudget?: number;
  lang?: string;
  countryCode?: string;
}

export interface JobListParams extends PaginationParams {
  status?: string;
  workArrangement?: string;
  countryCode?: string;
}

// Application
export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListParams extends PaginationParams {
  status?: string;
}

// Interview
export interface Interview {
  id: string;
  applicationId: string;
  questions: Record<string, unknown>[];
  scoringRubric: Record<string, unknown>;
  feedback?: Record<string, unknown>;
  outcome?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewInput {
  applicationId: string;
  questions: Record<string, unknown>[];
  scoringRubric: Record<string, unknown>;
  interviewLang?: string;
  scheduledAt?: string;
}

export interface ScoreInterviewInput {
  outcome: 'PASS' | 'FAIL';
  feedback?: Record<string, unknown>;
}

// Offer
export interface Offer {
  id: string;
  applicationId: string;
  salary: number;
  currency: string;
  workArrangement: string;
  startDate?: string;
  conditions?: Record<string, unknown>;
  status: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferInput {
  applicationId: string;
  salary: number;
  currency: string;
  workArrangement: 'ON_SITE' | 'HYBRID' | 'FULL_REMOTE' | 'REMOTE_FRIENDLY';
  startDate?: string;
  conditions?: Record<string, unknown>;
  expiresInDays?: number;
}

export interface NegotiateInput {
  proposedSalary?: number;
  proposedConditions?: Record<string, unknown>;
  startDate?: string;
  message: string;
}

export interface Negotiation {
  id: string;
  offerId: string;
  agentId: string;
  proposedSalary?: number;
  proposedConditions?: Record<string, unknown>;
  startDate?: string;
  message: string;
  createdAt: string;
}

// Matching
export interface MatchResult {
  candidateId?: string;
  jobId?: string;
  score: number;
  breakdown?: Record<string, unknown>;
}

// Deposit
export interface Deposit {
  id: string;
  employerId: string;
  amount: number;
  currency: string;
  chain: string;
  status: string;
  uniqueAmount?: string;
  payTo?: string;
  expiresIn?: number;
  createdAt: string;
}

export interface CreateDepositInput {
  jobId?: string;
  currency: 'USDC' | 'USDT';
  chain?: 'polygon' | 'ethereum' | 'tron';
  amount: number;
}

export interface DepositListParams extends PaginationParams {
  status?: string;
}

// Compliance
export interface ComplianceTip {
  id: string;
  trigger: string;
  title: string;
  description: string;
  severity: string;
}

export interface ComplianceParams {
  trigger: 'job_creation' | 'application' | 'offer_creation' | 'cross_border';
  jobCountry?: string;
  employerCountry?: string;
  candidateCountry?: string;
}

// Approval
export interface Approval {
  id: string;
  type: string;
  status: string;
  context: Record<string, unknown>;
  decision?: string;
  decidedAt?: string;
  expiresAt: string;
  createdAt: string;
}

// Reputation
export interface ReputationScore {
  score: number;
  breakdown: Record<string, unknown>;
}

// Heartbeat
export interface HeartbeatResult {
  status: string;
  lastActive: string;
  notifications: Record<string, unknown>[];
}

// Public
export interface PublicSearchParams extends PaginationParams {
  country?: string;
  workArrangement?: string;
  q?: string;
}

// Sandbox
export interface SandboxStatus {
  inSandbox: boolean;
  sandboxUntil?: string;
  verificationTier: string;
}
