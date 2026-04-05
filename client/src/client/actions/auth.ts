"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/client/state/auth";
import * as authService from "@/services/authService";
import type { LoginInput, RegisterInput } from "@/schemas/auth";
import type { AuthUser, Role } from "@/domain/types";

/**
 * Hook that exposes login / register actions.
 * Updates AuthContext on success.
 */
export function useAuthActions() {
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (input: LoginInput) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await authService.login(input);
        if (result.success) {
          const d = result.data;
          const user: AuthUser = {
            id: d.id,
            email: d.email,
            fullName: d.fullName,
            roles: d.roles as Role[],
          };
          setAuth(d.token, user);
          return true;
        }
        setError(result.error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setError(null);
      setIsLoading(true);
      try {
        const result = await authService.register(input);
        if (result.success) {
          const d = result.data;
          const user: AuthUser = {
            id: d.id,
            email: d.email,
            fullName: d.fullName,
            roles: d.roles as Role[],
          };
          setAuth(d.token, user);
          return true;
        }
        setError(result.error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  return { login, register, error, isLoading };
}
