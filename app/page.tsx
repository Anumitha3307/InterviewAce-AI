"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  Play,
  Brain,
  FileText,
  BarChart3,
  Zap,
  TrendingUp,
  MessageSquare,
  Star,
  Check,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                AI
              </div>
              <span className="hidden font-semibold text-zinc-900 dark:text-white sm:inline">
                InterviewAce
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Pricing
              </Link>
              <Link
                href="#faq"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                FAQ
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-zinc-200 py-4 dark:border-zinc-800">
              <div className="flex flex-col gap-4">
                <Link
                  href="#features"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  FAQ
                </Link>
                <div className="flex flex-col gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-zinc-900" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-blue-600 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            AI-Powered Interview Preparation
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
            Master Technical Interviews with AI
          </h1>

          <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Practice realistic interviews, receive AI-powered feedback, improve your skills, and land your dream software job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              Start Free
              <ArrowRight size={20} />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-8 py-3 text-lg font-semibold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900">
              <Play size={20} />
              Watch Demo
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 blur-2xl dark:opacity-5" />
            <div className="relative rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-12 dark:from-zinc-900 dark:to-zinc-800">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />
                    <div className="h-3 w-3 rounded-full bg-purple-600" />
                    <div className="h-3 w-3 rounded-full bg-pink-600" />
                  </div>
                  <div className="space-y-3 pt-4">
                    <div className="h-4 w-48 rounded bg-zinc-300 dark:bg-zinc-700" />
                    <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-8 uppercase tracking-wider">
            Trusted by professionals from
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {[
              { name: "Google", logo: "G" },
              { name: "Amazon", logo: "A" },
              { name: "Microsoft", logo: "M" },
              { name: "Meta", logo: "F" },
              { name: "Netflix", logo: "N" },
              { name: "Adobe", logo: "Ad" },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white py-8 px-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 font-semibold text-white">
                    {company.logo}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    {company.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Powerful Features for Interview Success
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Everything you need to prepare, practice, and excel in technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Mock Interviews",
                description:
                  "Realistic interview simulations with context-aware questions tailored to your target role.",
              },
              {
                icon: FileText,
                title: "Resume Analysis",
                description:
                  "Get detailed insights on your resume with specific recommendations to improve candidacy.",
              },
              {
                icon: Zap,
                title: "ATS Score",
                description:
                  "Check your resume compatibility with Applicant Tracking Systems and optimize for success.",
              },
              {
                icon: MessageSquare,
                title: "Company-Specific Questions",
                description:
                  "Practice with real interview questions from your target companies and roles.",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description:
                  "Monitor your improvement over time with detailed performance metrics and benchmarks.",
              },
              {
                icon: BarChart3,
                title: "AI Feedback",
                description:
                  "Get comprehensive feedback on your answers, communication, and areas for improvement.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-xl border border-zinc-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-700"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Three simple steps to prepare like never before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Upload Resume",
                description:
                  "Share your resume and select your target role. Our AI analyzes your background.",
              },
              {
                step: 2,
                title: "Practice Interview",
                description:
                  "Answer real interview questions with our conversational AI in real-time.",
              },
              {
                step: 3,
                title: "Track Progress",
                description:
                  "Monitor your improvement with analytics and personalized recommendations.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
                )}
                <div className="relative">
                  <div className="flex flex-col items-start">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 font-bold text-white text-lg">
                      {item.step}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "5 mock interviews/month",
                  "Resume analysis",
                  "Basic progress tracking",
                  "Email support",
                ],
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$29",
                description: "For serious preparation",
                features: [
                  "Unlimited mock interviews",
                  "Advanced resume analysis",
                  "Full progress analytics",
                  "Priority support",
                  "Personalized roadmap",
                  "Company-specific prep",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For organizations",
                features: [
                  "Everything in Pro",
                  "Team management",
                  "Custom questions",
                  "Dedicated account manager",
                  "API access",
                  "SSO",
                ],
                highlighted: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.highlighted
                    ? "border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl dark:border-blue-500 dark:from-blue-950 dark:to-purple-950"
                    : "border-zinc-200 bg-white hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-zinc-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 ml-2">
                    {plan.name === "Enterprise" ? "contact sales" : "per month"}
                  </span>
                </div>

                <Link
                  href="/auth/signup"
                  className={`block w-full rounded-lg py-3 text-center font-semibold transition-all mb-8 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                      : "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-950"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Link>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="mt-1 h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              All plans include a 7-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Trusted by Top Talent
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              See what professionals say about InterviewAce AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                content:
                  "InterviewAce transformed my interview prep. The AI feedback was incredibly specific. I landed my dream role!",
                rating: 5,
                image: "SC",
              },
              {
                name: "Marcus Johnson",
                role: "Senior Developer at Meta",
                content:
                  "The mock interviews were incredibly realistic. The AI adapted perfectly to my responses with great feedback.",
                rating: 5,
                image: "MJ",
              },
              {
                name: "Priya Patel",
                role: "PM at Microsoft",
                content:
                  "The personalized learning roadmap was exactly what I needed. Progress analytics kept me motivated.",
                rating: 5,
                image: "PP",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="mb-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 font-semibold text-white text-sm">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Find answers to common questions.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How realistic are the AI mock interviews?",
                answer:
                  "Our AI conducts interviews using real questions from tech companies. The system learns from thousands of interview patterns and provides dynamic follow-up questions based on your responses.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel anytime with no questions asked. No long-term contracts or hidden fees.",
              },
              {
                question: "What programming languages are supported?",
                answer:
                  "We support all major programming languages including Python, JavaScript/TypeScript, Java, C++, C#, Go, and Rust.",
              },
              {
                question: "Is my data secure and private?",
                answer:
                  "Yes. All data is encrypted in transit and at rest. We comply with GDPR and CCPA.",
              },
              {
                question: "How long until I see improvement?",
                answer:
                  "Most users report noticeable improvement within 2-3 weeks of consistent practice.",
              },
            ].map((faq, index) => (
              <button
                key={index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                className="w-full text-left"
              >
                <div className="rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      size={24}
                      className={`flex-shrink-0 text-zinc-600 transition-transform dark:text-zinc-400 ${
                        openFaqIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {openFaqIndex === index && (
                    <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-black/30" />

            <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center text-white">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who have successfully landed roles at top tech companies.
              </p>

              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-all hover:shadow-2xl hover:scale-105"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>

              <p className="mt-6 text-sm opacity-80">
                No credit card required. 7-day free trial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-5 mb-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  AI
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  InterviewAce
                </span>
              </Link>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Master technical interviews with AI-powered practice and feedback.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Legal
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 py-8" />

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              © {new Date().getFullYear()} InterviewAce AI. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="https://twitter.com"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Twitter
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                LinkedIn
              </Link>
              <Link
                href="https://github.com"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
