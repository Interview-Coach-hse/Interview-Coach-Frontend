import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api/admin.api";
import type { ProfilesFilters } from "@/features/profiles/api/profiles.api";

export function useAdminUsers(filters: { email?: string; roleCode?: string }) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminApi.users(filters),
  });
}

export function useAdminProfiles(filters: ProfilesFilters = { page: 0, size: 50 }) {
  return useQuery({
    queryKey: ["admin", "profiles", filters],
    queryFn: () => adminApi.profiles(filters),
  });
}

export function useAdminUser(userId?: string) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminApi.user(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminQuestions() {
  const queryClient = useQueryClient();

  return {
    listQuery: useQuery({
      queryKey: ["admin", "questions"],
      queryFn: adminApi.questions,
    }),
    createMutation: useMutation({
      mutationFn: adminApi.createQuestion,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "questions"] }),
    }),
    updateMutation: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminApi.updateQuestion>[1] }) =>
        adminApi.updateQuestion(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "questions"] }),
    }),
    deleteMutation: useMutation({
      mutationFn: adminApi.deleteQuestion,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "questions"] }),
    }),
  };
}

export function useAdminProfileEditor(profileId?: string) {
  const queryClient = useQueryClient();

  return {
    profileQuery: useQuery({
      queryKey: ["admin", "profile", profileId],
      queryFn: () => adminApi.profile(profileId!),
      enabled: Boolean(profileId),
    }),
    linksQuery: useQuery({
      queryKey: ["admin", "profile-links", profileId],
      queryFn: () => adminApi.profileQuestions(profileId!),
      enabled: Boolean(profileId),
    }),
    questionsQuery: useQuery({
      queryKey: ["admin", "questions", "options"],
      queryFn: adminApi.questions,
    }),
    saveMutation: useMutation({
      mutationFn: (payload: Parameters<typeof adminApi.updateProfile>[1]) =>
        profileId ? adminApi.updateProfile(profileId, payload) : adminApi.createProfile(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "profile", profileId] });
        queryClient.invalidateQueries({ queryKey: ["admin", "profile-links", profileId] });
      },
    }),
    publishMutation: useMutation({
      mutationFn: () => adminApi.publishProfile(profileId!),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "profile", profileId] });
      },
    }),
    archiveMutation: useMutation({
      mutationFn: () => adminApi.archiveProfile(profileId!),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "profile", profileId] });
      },
    }),
    addLinkMutation: useMutation({
      mutationFn: ({
        profileId: targetProfileId,
        payload,
      }: {
        profileId: string;
        payload: Parameters<typeof adminApi.addProfileQuestion>[1];
      }) => adminApi.addProfileQuestion(targetProfileId, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "profile-links", profileId] }),
    }),
    updateLinkMutation: useMutation({
      mutationFn: ({
        linkId,
        payload,
      }: {
        linkId: string;
        payload: Parameters<typeof adminApi.updateProfileQuestion>[2];
      }) => adminApi.updateProfileQuestion(profileId!, linkId, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "profile-links", profileId] }),
    }),
    deleteLinkMutation: useMutation({
      mutationFn: (linkId: string) => adminApi.deleteProfileQuestion(profileId!, linkId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "profile-links", profileId] }),
    }),
  };
}
