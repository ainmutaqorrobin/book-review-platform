import axios, { AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

const DEFAULT_API_ERROR_MESSAGE =
  "We couldn't connect right now. Please try again in a moment.";

export async function fetcher<T>(
  path: string,
  options: AxiosRequestConfig = {},
  fallbackData?: T,
): Promise<ApiResponse<T>> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  try {
    const response = await axios({
      url: `${baseURL}${path}`,
      method: options.method || "GET",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      data: options.data || undefined,
      params: options.params || undefined,
    });

    return response.data as ApiResponse<T>;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || DEFAULT_API_ERROR_MESSAGE,
      data: fallbackData as T,
    };
  }
}
