import { fetcher } from "@/lib/fetcher";

export function getCurrentUser() {
  return fetcher("/auth/me");
}

export function logout() {
  return fetcher("/auth/logout", { method: "POST" });
}

export function login(username: string, password: string) {
  return fetcher("/auth/login", {
    method: "POST",
    data: { username, password },
  });
}
