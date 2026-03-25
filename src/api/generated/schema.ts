export type UUID = string;

export enum UserStatus {
  Active = "ACTIVE",
  Blocked = "BLOCKED",
  Deleted = "DELETED",
}

export enum InterviewDirection {
  Backend = "BACKEND",
  Frontend = "FRONTEND",
  Devops = "DEVOPS",
}

export enum InterviewLevel {
  Junior = "JUNIOR",
  Middle = "MIDDLE",
}

export enum ProfileStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Archived = "ARCHIVED",
}

export enum QuestionType {
  Technical = "TECHNICAL",
  Behavioral = "BEHAVIORAL",
  General = "GENERAL",
}

export enum QuestionStatus {
  Active = "ACTIVE",
  Disabled = "DISABLED",
}

export enum SessionState {
  Created = "CREATED",
  InProgress = "IN_PROGRESS",
  Paused = "PAUSED",
  Finished = "FINISHED",
  Processing = "PROCESSING",
  Failed = "FAILED",
  Canceled = "CANCELED",
}

export enum SenderType {
  User = "USER",
  Interviewer = "INTERVIEWER",
  System = "SYSTEM",
}

export enum MessageType {
  Question = "QUESTION",
  Answer = "ANSWER",
  Info = "INFO",
  Error = "ERROR",
}

export enum ReportStatus {
  Pending = "PENDING",
  Ready = "READY",
  Failed = "FAILED",
}

export enum ReportItemType {
  Strength = "STRENGTH",
  Weakness = "WEAKNESS",
  Recommendation = "RECOMMENDATION",
  CategoryScore = "CATEGORY_SCORE",
}

export type ErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  code?: string | null;
  message: string;
  errors?: Record<string, string>;
};

export type PreferenceResponse = {
  preferredDirection?: InterviewDirection;
  preferredLevel?: InterviewLevel;
  preferredLanguage?: string;
  interfaceLanguage?: string;
  theme?: string;
};

export type UserResponse = {
  id: UUID;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: UserStatus;
  role: string;
  preference?: PreferenceResponse;
};

export type UpdateUserRequest = {
  firstName?: string;
  lastName?: string;
  preferredDirection?: InterviewDirection;
  preferredLevel?: InterviewLevel;
  preferredLanguage?: string;
  interfaceLanguage?: string;
  theme?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type EmailVerificationRequest = {
  email: string;
};

export type EmailVerificationConfirmRequest = {
  email: string;
  code: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetConfirmRequest = {
  token: string;
  newPassword: string;
};

export type PasswordResetResponse = {
  message?: string;
  resetToken?: string | null;
};

export type VerificationResponse = {
  message?: string;
  email?: string;
  code?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
};

export type ProfileQuestionResponse = {
  id?: UUID;
  questionId?: UUID;
  questionText?: string;
  questionType?: string;
  orderIndex?: number;
  required?: boolean;
};

export type ProfileResponse = {
  id?: UUID;
  title?: string;
  description?: string;
  direction?: InterviewDirection;
  level?: InterviewLevel;
  status?: ProfileStatus;
  tags?: string[];
  questions?: ProfileQuestionResponse[];
  publishedAt?: string | null;
};

export type ProfileRequest = {
  title: string;
  description: string;
  direction: InterviewDirection;
  level: InterviewLevel;
  tags?: string[];
};

export type ProfileQuestionRequest = {
  questionId: UUID;
  orderIndex: number;
  required?: boolean;
};

export type QuestionRequest = {
  text: string;
  questionType: QuestionType;
  difficulty?: InterviewLevel;
  direction?: InterviewDirection;
  status?: QuestionStatus;
};

export type QuestionResponse = {
  id?: UUID;
  text?: string;
  questionType?: QuestionType;
  difficulty?: InterviewLevel;
  direction?: InterviewDirection;
  status?: QuestionStatus;
  createdBy?: UUID;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateSessionRequest = {
  profileId: UUID;
};

export type SessionResponse = {
  id?: UUID;
  profileId?: UUID;
  profileTitle?: string;
  state?: SessionState;
  currentQuestionIndex?: number | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationSeconds?: number | null;
};

export type SessionStateResponse = {
  session?: SessionResponse;
  action?: string;
};

export type SessionMessageResponse = {
  id?: UUID;
  senderType?: SenderType;
  messageType?: MessageType;
  content?: string;
  sequenceNumber?: number;
  createdAt?: string;
};

export type SendMessageRequest = {
  message: string;
};

export type SendMessageResponse = {
  userMessage?: SessionMessageResponse;
  systemReply?: SessionMessageResponse;
};

export type ReportItemResponse = {
  itemType?: ReportItemType;
  title?: string;
  content?: string;
  score?: number | null;
  sortOrder?: number;
};

export type ReportResponse = {
  status?: ReportStatus;
  summaryText?: string | null;
  overallScore?: number | null;
  items?: ReportItemResponse[];
};

export type ProgressResponse = {
  totalSessions?: number;
  finishedSessions?: number;
  averageScore?: number | null;
  reportsReady?: number;
};

export type PageProfileResponse = {
  items?: ProfileResponse[];
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
};

export type PageSessionResponse = {
  items?: SessionResponse[];
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
};

export type PageSessionMessageResponse = {
  items?: SessionMessageResponse[];
  page?: number;
  size?: number;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
};

export type AdminUserUpdateRequest = {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
  roleCode?: string;
  preferredDirection?: InterviewDirection;
  preferredLevel?: InterviewLevel;
  preferredLanguage?: string;
  interfaceLanguage?: string;
  theme?: string;
};

export type AdminUserResponse = {
  id?: UUID;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  status?: UserStatus;
  roleCode?: string;
  preference?: PreferenceResponse;
};
