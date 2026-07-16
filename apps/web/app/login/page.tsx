"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/client-api";
import { setToken } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await login(email, password);
      setToken(access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo.png" alt="Drishti" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <div className="text-white font-bold text-xl">Drishti</div>
            <div className="text-white/30 text-xs">Admin Portal</div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          <h1 className="text-white font-semibold text-lg">Sign in</h1>

          <div className="space-y-1">
            <label className="text-white/50 text-xs font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-white/50 text-xs font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/30"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
