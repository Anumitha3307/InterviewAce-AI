import { Globe } from "lucide-react";

export function SocialLogin() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
    >
      <Globe size={18} className="text-blue-400" />
      Continue with Google
    </button>
  );
}
