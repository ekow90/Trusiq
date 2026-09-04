import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(body.error || "Administrator sign in failed");
      setAuth(body.user, body.token);
      const returnTo = searchParams.get("returnTo");
      navigate(returnTo?.startsWith("/") ? returnTo : "/admin");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Administrator sign in failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#091827] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#102b43] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-9">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#a7c8e6]"
        >
          <i className="bi bi-arrow-left" /> Return to sign in
        </Link>
        <div className="mt-10 grid size-14 place-items-center rounded-2xl bg-[#2f68f1] text-2xl shadow-[0_12px_25px_rgba(47,104,241,0.3)]">
          <i className="bi bi-shield-lock" />
        </div>
        <p className="mt-7 text-[11px] font-black uppercase tracking-[0.22em] text-[#a7c8e6]">
          Restricted access
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">
          Administrator sign in
        </h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-[#c6ddef]">
          Use your administrator credentials to access moderation and platform
          controls.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-black">
            <span>Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-[#8aa0b2] focus:border-[#7eb8df]"
              placeholder="Administrator email"
            />
          </label>
          <label className="grid gap-2 text-sm font-black">
            <span>Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl border border-white/10 bg-white/10 px-4 text-white outline-none placeholder:text-[#8aa0b2] focus:border-[#7eb8df]"
              placeholder="Administrator password"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-[#f7c7c7]/30 bg-[#8b3030]/20 px-4 py-3 text-sm font-semibold text-[#ffd1d1]"
            >
              {error}
            </p>
          )}
          <button
            disabled={busy}
            type="submit"
            className="h-13 rounded-xl border border-[#7eb8df]/30 bg-gradient-to-r from-[#2f68f1] to-[#6aa8ff] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(47,104,241,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Verifying..." : "Enter administrator console"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLoginPage;
