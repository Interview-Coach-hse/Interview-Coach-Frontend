import { request } from "@/api";
import type { PageProfileResponse, ProfileResponse, UUID } from "@/api/generated/schema";

export type ProfilesFilters = {
  direction?: string;
  level?: string;
  query?: string;
  tag?: string;
  page?: number;
  size?: number;
};

export const profilesApi = {
  list: (filters: ProfilesFilters) =>
    request<PageProfileResponse>("/profiles", {
      auth: false,
      query: filters,
    }),
  detail: (profileId: UUID) =>
    request<ProfileResponse>(`/profiles/${profileId}`, {
      auth: false,
    }),
};
