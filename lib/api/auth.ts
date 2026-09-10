import { apiFetch } from "./client";
import type { StoredUser } from "../auth-storage";

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: StoredUser;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
