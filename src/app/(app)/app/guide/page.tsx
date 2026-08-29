import { redirect } from "next/navigation";

export default function GuidePage() {
  redirect("/app/journey?filter=guide");
}
