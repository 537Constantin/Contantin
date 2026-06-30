import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { clerkEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Anmelden" };

export default function SignInPage() {
  if (!clerkEnabled) redirect("/dashboard");
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="flex flex-col items-center">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink">
            <Sparkles className="h-4.5 w-4.5 text-canvas" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">
            Smart<span className="text-gradient-brand">Staff</span>
          </span>
        </Link>
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
