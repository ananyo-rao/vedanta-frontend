import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle user.created event
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? "";
    const name = [first_name, last_name].filter(Boolean).join(" ");

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/app";

    try {
      const response = await fetch(`${API_URL}/api/internal/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: id,
          email,
          name,
          role: "member",
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to sync user to backend:",
          await response.text(),
        );
        return new Response("Backend sync failed", { status: 500 });
      }
    } catch (err) {
      console.error("Failed to reach backend:", err);
      return new Response("Backend unreachable", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}
