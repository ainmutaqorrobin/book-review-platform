import axios, { AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetcher<T>(
  path: string,
  options: AxiosRequestConfig = {},
  fallbackData?: T
): Promise<ApiResponse<T>> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const response = await axios({
      url: `${baseURL}${path}`,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      data: options.data || undefined,
      params: options.params || undefined,
    });

    return response.data as ApiResponse<T>;
  } catch (error: any) {
    console.error("❌ API Error:", error.message);

    // Use fallbackData if provided
    return {
      success: false,
      message: "Backend not reachable. Showing empty data.",
      data: fallbackData as T,
    };
  }
}
