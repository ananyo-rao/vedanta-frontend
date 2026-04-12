const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";

export { API_URL };

export async function fetchWithAuth(
  url: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const serverMessage = errorBody?.error?.message;
    // Only surface client-safe error messages (4xx); mask server errors (5xx)
    const message =
      res.status >= 500
        ? "Something went wrong. Please try again later."
        : serverMessage || `Request failed. Please try again.`;
    throw new Error(message);
  }

  return res.json();
}
