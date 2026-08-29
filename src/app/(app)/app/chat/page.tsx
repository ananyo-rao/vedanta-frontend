import { redirect } from "next/navigation";

export default function ChatPage() {
  redirect("/app/journey?filter=ai");
}
