import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/services/platform";

export async function requireViewer() {
  const viewer = await getViewer();

  if (!viewer && isSupabaseConfigured) {
    redirect("/login");
  }

  return viewer!;
}
