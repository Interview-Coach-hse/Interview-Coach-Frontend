import { useQuery } from "@tanstack/react-query";
import { request } from "@/api";
import type { InterviewDirection, InterviewLevel, ProgressResponse } from "@/api/generated/schema";

export type ProgressFilters = {
  createdFrom?: string;
  createdTo?: string;
  direction?: InterviewDirection | "";
  level?: InterviewLevel | "";
};

export function useProgress(filters: ProgressFilters = {}) {
  return useQuery({
    queryKey: ["progress", filters],
    queryFn: () => request<ProgressResponse>("/progress", { query: filters }),
  });
}
