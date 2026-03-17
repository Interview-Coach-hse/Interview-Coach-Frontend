import { request } from "@/api";
import type { UpdateUserRequest, UserResponse } from "@/api/generated/schema";

export const userApi = {
  getCurrent: () => request<UserResponse>("/user"),
  update: (payload: UpdateUserRequest) =>
    request<UserResponse>("/user", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
