import { create } from "zustand";
import type { UserResponse } from "@/api/generated/schema";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  user: UserResponse | null;
  tokens: SessionTokens | null;
  hydrated: boolean;
  setSession: (payload: { user: UserResponse; tokens: SessionTokens }) => void;
  setTokens: (tokens: SessionTokens) => void;
  clearSession: () => void;
  markHydrated: () => void;
};

const storageKey = "interview-coach-auth";

function sanitizeToken(token: string) {
  return token.replace(/^Bearer\s+/i, "").trim();
}

function sanitizeTokens(tokens: SessionTokens): SessionTokens {
  return {
    accessToken: sanitizeToken(tokens.accessToken),
    refreshToken: sanitizeToken(tokens.refreshToken),
  };
}

function loadPersistedState() {
  const raw = localStorage.getItem(storageKey);

  if (!raw) {
    return { user: null, tokens: null };
  }

  try {
    const parsed = JSON.parse(raw) as Pick<AuthState, "user" | "tokens">;

    return {
      user: parsed.user,
      tokens: parsed.tokens ? sanitizeTokens(parsed.tokens) : null,
    };
  } catch {
    return { user: null, tokens: null };
  }
}

function persistState(state: Pick<AuthState, "user" | "tokens">) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

const persisted = typeof window !== "undefined" ? loadPersistedState() : { user: null, tokens: null };

export const authStore = create<AuthState>((set) => ({
  user: persisted.user,
  tokens: persisted.tokens,
  hydrated: false,
  setSession: ({ user, tokens }) =>
    set(() => {
      const sanitizedTokens = sanitizeTokens(tokens);
      persistState({ user, tokens: sanitizedTokens });
      return { user, tokens: sanitizedTokens };
    }),
  setTokens: (tokens) =>
    set((state) => {
      const sanitizedTokens = sanitizeTokens(tokens);
      persistState({ user: state.user, tokens: sanitizedTokens });
      return { tokens: sanitizedTokens };
    }),
  clearSession: () =>
    set(() => {
      persistState({ user: null, tokens: null });
      return { user: null, tokens: null };
    }),
  markHydrated: () => set({ hydrated: true }),
}));
