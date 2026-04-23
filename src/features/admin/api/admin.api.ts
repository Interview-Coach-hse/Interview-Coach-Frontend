import { request } from "@/api";
import type {
  InterviewDirection,
  InterviewLevel,
  AdminUserResponse,
  AdminUserUpdateRequest,
  PageProfileResponse,
  ProfileQuestionRequest,
  ProfileQuestionResponse,
  ProfileRequest,
  ProfileResponse,
  QuestionStatus,
  QuestionRequest,
  QuestionResponse,
  QuestionType,
  UUID,
} from "@/api/generated/schema";

export type QuestionSortBy = "updatedAt" | "createdAt" | "text";
export type QuestionSortDir = "asc" | "desc";

export type AdminQuestionsFilters = {
  query?: string;
  search?: string;
  direction?: InterviewDirection | "";
  difficulty?: InterviewLevel | "";
  questionType?: QuestionType | "";
  status?: QuestionStatus | "";
  excludeProfileId?: UUID;
  page?: number;
  size?: number;
  sortBy?: QuestionSortBy;
  sortDir?: QuestionSortDir;
};

export type PageQuestionResponse = {
  items?: QuestionResponse[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

export const adminApi = {
  users: (filters: { email?: string; roleCode?: string }) =>
    request<AdminUserResponse[]>("/admin/users", { query: filters }),
  user: (userId: UUID) => request<AdminUserResponse>(`/admin/users/${userId}`),
  profiles: (filters?: { page?: number; size?: number; direction?: string; level?: string; query?: string; tag?: string }) =>
    request<PageProfileResponse>("/admin/profiles", { query: filters }),
  profile: (profileId: UUID) => request<ProfileResponse>(`/admin/profiles/${profileId}`),
  updateUser: (userId: UUID, payload: AdminUserUpdateRequest) =>
    request<AdminUserResponse>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  questions: (filters?: AdminQuestionsFilters) =>
    request<PageQuestionResponse>("/admin/questions", { query: filters }),
  question: (questionId: UUID) => request<QuestionResponse>(`/admin/questions/${questionId}`),
  createQuestion: (payload: QuestionRequest) =>
    request<QuestionResponse>("/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuestion: (questionId: UUID, payload: QuestionRequest) =>
    request<QuestionResponse>(`/admin/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteQuestion: (questionId: UUID) =>
    request<void>(`/admin/questions/${questionId}`, {
      method: "DELETE",
    }),
  createProfile: (payload: ProfileRequest) =>
    request<ProfileResponse>("/admin/profiles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProfile: (profileId: UUID, payload: ProfileRequest) =>
    request<ProfileResponse>(`/admin/profiles/${profileId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  publishProfile: (profileId: UUID) =>
    request<ProfileResponse>(`/admin/profiles/${profileId}/publish`, { method: "POST" }),
  archiveProfile: (profileId: UUID) =>
    request<ProfileResponse>(`/admin/profiles/${profileId}/archive`, { method: "POST" }),
  profileQuestions: (profileId: UUID) =>
    request<ProfileQuestionResponse[]>(`/admin/profiles/${profileId}/questions`),
  addProfileQuestion: (profileId: UUID, payload: ProfileQuestionRequest) =>
    request<ProfileQuestionResponse>(`/admin/profiles/${profileId}/questions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProfileQuestion: (profileId: UUID, linkId: UUID, payload: ProfileQuestionRequest) =>
    request<ProfileQuestionResponse>(`/admin/profiles/${profileId}/questions/${linkId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteProfileQuestion: (profileId: UUID, linkId: UUID) =>
    request<void>(`/admin/profiles/${profileId}/questions/${linkId}`, { method: "DELETE" }),
};
