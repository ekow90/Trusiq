import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export function MainLayout() {
  const navigate = useNavigate();
  const { user, sessionExpired, clearSessionExpired } = useAuth();

  return (
    <div className="min-h-screen bg-black text-[#1f2430]">
      <main>
        <Outlet />
      </main>
      {user && (
        <Link
          to="/settings"
          className="fixed right-4 top-4 z-40 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-white/70 bg-white/90 py-1.5 pl-1.5 pr-3 text-[#12304a] shadow-[0_12px_30px_rgba(18,48,74,0.14)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg"
          aria-label="Open account settings"
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-[#12304a] text-xs font-black text-white">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
          <span className="min-w-0">
            <span className="block max-w-[130px] truncate text-xs font-black">
              {user.name || "Account"}
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
              {user.roles.includes("admin")
                ? "Administrator"
                : user.roles.includes("owner")
                  ? "Business"
                  : "Customer"}
            </span>
          </span>
        </Link>
      )}
      {sessionExpired && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#12304a]/60 px-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-expired-title"
            className="w-full max-w-md rounded-[28px] border border-[#dfeaf6] bg-white p-7 text-[#12304a] shadow-[0_30px_90px_rgba(18,48,74,0.3)]"
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-[#eef4ff] text-2xl text-[#2f68f1]">
              <i className="bi bi-shield-lock" aria-hidden="true" />
            </div>
            <h2
              id="session-expired-title"
              className="mt-5 text-2xl font-black tracking-[-0.04em]"
            >
              Session expired
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#647b8b]">
              You were signed out after 10 minutes without activity. Sign in
              again to continue securely.
            </p>
            <button
              type="button"
              onClick={() => {
                clearSessionExpired();
                navigate("/login");
              }}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#12304a] via-[#1b4068] to-[#2f68f1] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(47,104,241,0.22)] transition hover:-translate-y-0.5"
            >
              Sign in again
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
