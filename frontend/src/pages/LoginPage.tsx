import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"customer" | "owner">("customer");

  async function handleSocialLogin(provider: "google" | "microsoft" | "apple") {
    try {
      const resp = await fetch(`/api/oauth/${provider}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || `${provider}-user@example.com`,
          name: "Social user",
          providerUserId: `${provider}-demo-user`,
          avatar: null,
          roles: [loginRole],
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        alert(err.error || `Unable to sign in with ${provider}`);
        return;
      }

      const body = await resp.json();
      setAuth(body.user, body.token);
      if (body.user.roles.includes("admin")) navigate("/admin");
      else if (body.user.roles.includes("owner")) navigate("/dashboard");
      else navigate("/search");
    } catch (error) {
      alert(`Unable to continue with ${provider} sign-in`);
    }
  }

  const trustPoints = [
    "Secure business-grade authentication",
    "Fast access to verified listings",
    "Designed for confidence and clarity",
  ];

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell min-h-screen flex flex-col justify-center px-4 py-10">
        <main className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[36px] bg-[#12304a] p-8 text-white shadow-[0_24px_90px_rgba(18,48,74,0.18)] sm:p-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm font-black uppercase tracking-[0.24em] text-[#c6def9]">
                <i className="bi bi-shield-check" aria-hidden="true" />
                Secure access
              </div>
              <h1 className="mt-8 text-4xl font-black leading-tight tracking-[-0.05em] sm:text-5xl">
                Login to Trusiq
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#d4e6f7]">
                Access your trust dashboard, manage verified connections, and
                keep your business decisions backed by clear reputation signals.
              </p>

              <div className="mt-10 space-y-4">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eff7ff] text-[#12304a]">
                      <i className="bi bi-check-lg" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold leading-6 text-[#d4e6f7]">
                      {point}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-5 rounded-[28px] border border-white/10 bg-white/5 p-6 text-[#d4e6f7] sm:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a7c8e6]">
                    Built for business
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#c6ddef]">
                    Keep your account secure with enterprise-inspired sign-in
                    controls and trusted workflows.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a7c8e6]">
                    Reliable support
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#c6ddef]">
                    Our platform is designed to help business users feel
                    confident every step of the way.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] bg-white p-8 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-10">
            <div className="mb-8 text-center">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#657b8b]">
                Trusted login
              </p>
              <h2 className="mt-4 text-3xl font-black text-[#12304a]">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#657b8b]">
                Securely access business tools and verified trust data.
              </p>
            </div>

            <form
              className="grid gap-5"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  const resp = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role: loginRole }),
                  });
                  if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    alert(err.error || "Login failed");
                    return;
                  }
                  const body = await resp.json();
                  // body: { token, user }
                  setAuth(body.user, body.token);
                  // navigate based on role
                  if (body.user.roles.includes("admin")) navigate("/admin");
                  else if (body.user.roles.includes("owner"))
                    navigate("/dashboard");
                  else navigate("/search");
                } catch (e) {
                  // fallback
                  alert("Login error");
                }
              }}
            >
              <label className="grid gap-2">
                <span className="text-sm font-black text-[#12304a]">
                  Email address
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4 text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                  placeholder="you@company.com"
                  type="email"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-[#12304a]">
                  Password
                </span>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#d8e6ef] bg-[#f8fbff] px-4">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#657b8b]"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    className="text-lg text-[#657b8b] transition hover:text-[#12304a]"
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[#657b8b]">
                  <input
                    type="radio"
                    checked={loginRole === "customer"}
                    onChange={() => setLoginRole("customer")}
                  />
                  <span>Customer</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#657b8b]">
                  <input
                    type="radio"
                    checked={loginRole === "owner"}
                    onChange={() => setLoginRole("owner")}
                  />
                  <span>Business owner</span>
                </label>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-[#657b8b]">
                  <input
                    checked={rememberMe}
                    className="h-4 w-4 rounded border-[#d8c2ad] accent-[#12304a]"
                    type="checkbox"
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Remember me
                </label>
                <button
                  className="text-sm font-black text-[#12304a] transition hover:text-[#0f2840]"
                  type="button"
                >
                  Forgot password?
                </button>
              </div>

              <button
                className="mt-2 flex h-14 w-full items-center justify-center rounded-3xl bg-[#12304a] text-base font-black text-white shadow-[0_18px_32px_rgba(18,48,74,0.18)] transition hover:bg-[#0f283f] active:translate-y-0.5"
                type="submit"
              >
                Login
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#b09b88]">
              <span className="h-px flex-1 bg-[#f0e3d5]" />
              or
              <span className="h-px flex-1 bg-[#f0e3d5]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <ProviderButton
                icon="bi-google"
                label="Google"
                onClick={() => handleSocialLogin("google")}
              />
              <ProviderButton
                icon="bi-apple"
                label="Apple"
                onClick={() => handleSocialLogin("apple")}
              />
              <ProviderButton
                icon="bi-microsoft"
                label="Microsoft"
                onClick={() => handleSocialLogin("microsoft")}
              />
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-[#657b8b]">
              Don’t have an account?{" "}
              <Link
                className="font-black text-[#12304a] transition hover:text-[#0f283f]"
                to="/register"
              >
                Create one
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function ProviderButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#d8e6ef] bg-white px-4 text-sm font-black text-[#12304a] transition hover:-translate-y-0.5 hover:border-[#7eb8df] hover:bg-[#f4f9fc] active:translate-y-0"
      type="button"
      onClick={onClick}
    >
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
    </button>
  );
}
