"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export const signupFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms and Privacy Policy to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null);
    setServerSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.details) {
          // Map backend field errors to form fields
          for (const [field, messages] of Object.entries(result.details)) {
            if (Array.isArray(messages) && messages.length > 0) {
              setError(field as keyof SignupFormValues, {
                type: "server",
                message: messages[0],
              });
            }
          }
        }
        setServerError(result.error || "Registration failed. Please try again.");
        return;
      }

      setServerSuccess(result.message || "Account created successfully! Redirecting to login...");
      reset();

      // Redirect to login page after brief delay
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch {
      setServerError("An unexpected network error occurred. Please try again.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Global Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Global Server Success Alert */}
      {serverSuccess && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-medium">{serverSuccess}</p>
            <p className="mt-1 text-emerald-400/80">
              <Link href="/auth/login" className="underline hover:text-emerald-200">
                Click here if you are not redirected automatically
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-200">
          Full Name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            placeholder="Sarah Connor"
            {...register("fullName")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.fullName
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-400">{errors.fullName.message}</p>
        )}
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium text-zinc-200">
          Username
        </label>
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="username"
            type="text"
            autoComplete="username"
            disabled={isSubmitting}
            placeholder="sarahconnor"
            {...register("username")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.username
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-200">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            placeholder="you@example.com"
            {...register("email")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
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

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isSubmitting}
            placeholder="At least 8 characters"
            {...register("password")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.password
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-zinc-200"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={isSubmitting}
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
            className={`w-full rounded-xl border bg-zinc-900/80 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 disabled:opacity-50 ${
              errors.confirmPassword
                ? "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                : "border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-200"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-1 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            id="termsAccepted"
            type="checkbox"
            disabled={isSubmitting}
            {...register("termsAccepted")}
            className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-xs leading-relaxed text-zinc-400">
            I agree to the{" "}
            <Link
              href="#terms"
              className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#privacy"
              className="text-blue-400 underline underline-offset-2 hover:text-blue-300"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="text-xs text-red-400">{errors.termsAccepted.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          "Sign Up"
        )}
      </button>
    </form>
  );
}
