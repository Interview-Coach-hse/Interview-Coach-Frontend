import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStore } from "@/features/auth/hooks/auth-store";
import { userApi } from "@/features/user/api/user.api";

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const setSession = authStore((state) => state.setSession);
  const tokens = authStore((state) => state.tokens);

  const query = useQuery({
    queryKey: ["user"],
    queryFn: userApi.getCurrent,
  });

  const updateMutation = useMutation({
    mutationFn: userApi.update,
    onSuccess: (user) => {
      if (tokens) {
        setSession({ user, tokens });
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return { query, updateMutation };
}
