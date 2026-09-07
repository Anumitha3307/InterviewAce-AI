"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    mode: "onBlur",
  });

  // Derive error from searchParams if redirected from NextAuth
  const errorParam = searchParams.get("error");
  const urlError =
    errorParam === "CredentialsSignin"
      ? "Invalid email or password. Please check your credentials."
      : errorParam
      ? "Authentication failure. Please try again."
      : null;

  const displayError = authError ?? urlError;

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result) {
        setAuthError("Authentication failure. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        if (result.error === "CredentialsSignin") {
          setAuthError("Invalid email or password. Please check your credentials.");
        } else {
          setAuthError("Authentication failure. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      if (result.ok) {
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setAuthError("Authentication failure. An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const isRegistered = searchParams.get("registered") === "true";

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegistered && !displayError && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>Account created successfully! Please log in with your credentials.</span>
        </div>
      )}

      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-200">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isLoading}
            placeholder="you@example.com"
            {...register("email")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.email
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            disabled={isLoading}
            placeholder="Enter your password"
            {...register("password")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-3 pl-10 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.password
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            disabled={isLoading}
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          Remember me
        </label>

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          "Log in"
        )}
      </button>
    </form>
  );
}
