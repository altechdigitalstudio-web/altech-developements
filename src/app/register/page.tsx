import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free Altech Hub QR Studio account with dynamic codes and analytics.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
