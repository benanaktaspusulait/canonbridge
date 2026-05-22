import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up | CanonBridge",
  description: "Create your free CanonBridge account and start mapping data in minutes.",
};

/**
 * W-V8-H3 FIX: Signup page — redirects to the demo form for now.
 * When self-service signup is implemented, this will render a registration form.
 */
export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  // For now, redirect to the homepage demo section
  // In production, this will be a full registration form
  redirect("/#demo");
}
