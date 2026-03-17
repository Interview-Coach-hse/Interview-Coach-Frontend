import { useQuery } from "@tanstack/react-query";
import { request } from "@/api";
import type { ProgressResponse } from "@/api/generated/schema";

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => request<ProgressResponse>("/progress"),
  });
}
