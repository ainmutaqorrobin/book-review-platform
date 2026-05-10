import { ApiResponse, fetcher } from "@/lib/fetcher";

export type Role = "guest" | "user" | "admin";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: Exclude<Role, "guest">;
  created_at: string;
}

export interface SignupPayload {
  username: string;
  name: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export function getCurrentUser(): Promise<ApiResponse<AuthUser>> {
  return fetcher<AuthUser>("/auth/me");
}

export function signup(payload: SignupPayload): Promise<ApiResponse<AuthUser>> {
  return fetcher<AuthUser>("/auth/signup", {
    method: "POST",
    data: payload,
  });
}

export function logout(): Promise<ApiResponse<null>> {
  return fetcher<null>("/auth/logout", { method: "POST" });
}

export function login(
  username: string,
  password: string,
): Promise<ApiResponse<null>> {
  return fetcher<null>("/auth/login", {
    method: "POST",
    data: { username, password },
  });
}

export function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResponse<AuthUser>> {
  return fetcher<AuthUser>("/auth/password", {
    method: "PATCH",
    data: payload,
  });
}
