import { QueryClient, QueryFunction } from "@tanstack/react-query";

// CHANGE: Set this to an empty string so it uses the Vite Proxy
const API_BASE_URL = "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("forceLogout"));
    }
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem("authToken");
  const headers: HeadersInit = data
    ? { "Content-Type": "application/json" }
    : {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // This will now request "http://localhost:5173/api/..."
  // The Vite Proxy will forward it to "http://127.0.0.1:5000/api/..."
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const response = await apiRequest("GET", queryKey.join("/"));
  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});
