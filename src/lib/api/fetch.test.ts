import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWithAuth, API_URL } from "./fetch";

describe("fetchWithAuth", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends Authorization header with Bearer token", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: "test" }),
    } as Response);

    await fetchWithAuth("https://api.example.com/test", "my-token");

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts?.headers).toHaveProperty("Authorization", "Bearer my-token");
  });

  it("sends Content-Type: application/json header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await fetchWithAuth("https://api.example.com/test", "token");

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts?.headers).toHaveProperty("Content-Type", "application/json");
  });

  it("passes additional options through", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await fetchWithAuth("https://api.example.com/test", "token", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });

    const [, opts] = fetchSpy.mock.calls[0];
    expect(opts?.method).toBe("POST");
    expect(opts?.body).toBe(JSON.stringify({ key: "value" }));
  });

  it("returns parsed JSON on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "123" } }),
    } as Response);

    const result = await fetchWithAuth(
      "https://api.example.com/test",
      "token"
    );
    expect(result).toEqual({ data: { id: "123" } });
  });

  it("throws Error with message from error body on non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "Invalid input" } }),
    } as Response);

    await expect(
      fetchWithAuth("https://api.example.com/test", "token")
    ).rejects.toThrow("Invalid input");
  });

  it("throws generic error for 5xx responses regardless of body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: "internal db error" } }),
    } as Response);

    await expect(
      fetchWithAuth("https://api.example.com/test", "token")
    ).rejects.toThrow("Something went wrong. Please try again later.");
  });

  it("throws generic error when error body cannot be parsed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);

    await expect(
      fetchWithAuth("https://api.example.com/test", "token")
    ).rejects.toThrow("Something went wrong. Please try again later.");
  });

  it("surfaces server message for 4xx errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    await expect(
      fetchWithAuth("https://api.example.com/test", "token")
    ).rejects.toThrow("Request failed. Please try again.");
  });

  it("exports API_URL from env or default", () => {
    expect(typeof API_URL).toBe("string");
    expect(API_URL.length).toBeGreaterThan(0);
  });
});
