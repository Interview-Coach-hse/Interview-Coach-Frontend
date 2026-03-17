import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { authStore } from "@/features/auth/hooks/auth-store";
import { userApi } from "@/features/user/api/user.api";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = authStore((state) => state.user);
  const tokens = authStore((state) => state.tokens);
  const hydrated = authStore((state) => state.hydrated);
  const setSession = authStore((state) => state.setSession);
  const clearSession = authStore((state) => state.clearSession);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: userApi.getCurrent,
    enabled: hydrated && Boolean(tokens?.accessToken),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!tokens?.refreshToken) {
        return;
      }

      return authApi.logout({ refreshToken: tokens.refreshToken });
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });

  return {
    user: meQuery.data ?? user,
    tokens,
    meQuery,
    loginMutation,
    logoutMutation,
    clearSession,
    isAdmin: (meQuery.data ?? user)?.role === "ADMIN" || (meQuery.data ?? user)?.role === "ROLE_ADMIN",
  };
}
