const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "" : "http://localhost:5000");

const AUTH_TOKEN_STORAGE_KEY = "hospify.authToken";

interface ApiErrorBody {
  message?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: ApiErrorBody["errors"],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },
  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  },
};

const buildUrl = (endpoint: string): string => `${API_BASE_URL}${endpoint}`;

export async function apiRequest<TResponse>(
  endpoint: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const body = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    const validationMessage = errorBody?.errors?.map((error) => error.message).filter(Boolean).join(", ");
    throw new ApiError(
      validationMessage || errorBody?.message || "Something went wrong. Please try again.",
      response.status,
      errorBody?.errors,
    );
  }

  return body as TResponse;
}
