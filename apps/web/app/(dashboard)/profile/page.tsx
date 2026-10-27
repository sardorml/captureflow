import { redirect } from "next/navigation";

// Account settings live under /settings/personal; the route is kept so existing links
// (the account menu shipped in older desktop builds) don't 404.
export default function ProfileRedirect() {
  redirect("/settings/personal");
}
