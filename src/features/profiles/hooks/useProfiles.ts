import { useQuery } from "@tanstack/react-query";
import { profilesApi, type ProfilesFilters } from "@/features/profiles/api/profiles.api";

export function useProfiles(filters: ProfilesFilters) {
  return useQuery({
    queryKey: ["profiles", filters],
    queryFn: () => profilesApi.list(filters),
  });
}

export function useProfile(profileId?: string) {
  return useQuery({
    queryKey: ["profiles", profileId],
    queryFn: () => profilesApi.detail(profileId!),
    enabled: Boolean(profileId),
  });
}
