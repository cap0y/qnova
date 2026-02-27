type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function apiRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
