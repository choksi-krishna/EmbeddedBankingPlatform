import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LegacyApiKeysRedirect() {
  redirect("/dashboard/api-keys");
}
