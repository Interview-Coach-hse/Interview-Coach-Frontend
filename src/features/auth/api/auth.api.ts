import { request } from "@/api";
import type {
  AuthResponse,
  EmailVerificationConfirmRequest,
  EmailVerificationRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  RefreshTokenRequest,
  RegisterRequest,
  VerificationResponse,
} from "@/api/generated/schema";

export const authApi = {
  register: (payload: RegisterRequest) =>
    request<VerificationResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  verifyEmailRequest: (payload: EmailVerificationRequest) =>
    request<VerificationResponse>("/auth/verify-email/request", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  verifyEmailConfirm: (payload: EmailVerificationConfirmRequest) =>
    request<void>("/auth/verify-email/confirm", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  logout: (payload: RefreshTokenRequest) =>
    request<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  refresh: (payload: RefreshTokenRequest) =>
    request<AuthResponse>("/auth/refresh", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  requestPasswordReset: (payload: PasswordResetRequest) =>
    request<{ message?: string; resetToken?: string | null }>("/auth/password/reset", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
  confirmPasswordReset: (payload: PasswordResetConfirmRequest) =>
    request<void>("/auth/password/reset/confirm", {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }),
};
