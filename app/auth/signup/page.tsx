import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard
        tagline="Get started"
        title="Create your account"
        description="Start preparing for your dream engineering role with AI mock interviews and ATS resume analysis."
        footer={
          <p className="mt-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Log in
            </Link>
          </p>
        }
      >
        <SignupForm />
      </AuthCard>
    </AuthLayout>
  );
}
