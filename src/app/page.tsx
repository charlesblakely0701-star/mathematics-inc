import { redirect } from "next/navigation";

// The proxy handles the redirect for logged-in/logged-out users before this
// ever renders. This is a fallback in case the proxy is bypassed.
export default function RootPage() {
  redirect("/login");
}
