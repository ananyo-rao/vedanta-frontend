import { fetchWithAuth } from "./fetch";

const DHARMA_API_URL =
  process.env.NEXT_PUBLIC_DHARMA_API_URL || "http://localhost:8081/api";

export interface Teaching {
  id: string;
  type: "vedantic" | "psychological";
  questions: string[];
  description: string;
  logged_at: string;
}

export interface NewTeaching {
  type: "vedantic" | "psychological";
  questions: string[];
  description: string;
  timestamp?: string;
}

export async function getTeachings(token: string): Promise<Teaching[]> {
  const res = await fetchWithAuth(`${DHARMA_API_URL}/teachings`, token);
  return (res.data as Teaching[]) ?? [];
}

export async function addTeaching(token: string, input: NewTeaching): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/teachings`, token, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteTeaching(token: string, id: string): Promise<void> {
  await fetchWithAuth(`${DHARMA_API_URL}/teachings/${id}`, token, {
    method: "DELETE",
  });
}
