import { redirect } from "next/navigation";

import { departments } from "@/features/app-shell/nav";

export default function ManageIndexPage() {
  redirect(`/manage/${departments[0].slug}`);
}
