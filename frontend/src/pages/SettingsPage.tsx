import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAdmin = user?.roles.includes("admin");
  const isOwner = user?.roles.includes("owner");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [locationVerification, setLocationVerification] = useState(true);
  const [saved, setSaved] = useState(false);

  function savePreferences() {
    localStorage.setItem(
      "trusiq_settings",
      JSON.stringify({ emailAlerts, locationVerification }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[900px]">
        <header className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-black text-[#2f68f1]"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" /> Back
          </Link>
          <span className="rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad] shadow-sm">
            TRUSIQ account
          </span>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="rounded-[30px] bg-[#12304a] p-7 text-white shadow-[0_25px_70px_rgba(18,48,74,0.2)] sm:p-8">
            <div className="grid size-14 place-items-center rounded-2xl bg-white/10 text-2xl">
              <i className="bi bi-sliders2" aria-hidden="true" />
            </div>
            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-[#a7c8e6]">
              Platform settings
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">
              {isAdmin
                ? "Platform command."
                : isOwner
                  ? "Business control room."
                  : "Trust control room."}
            </h1>
            <p className="mt-5 text-sm font-semibold leading-7 text-[#d4e6f7]">
              Manage your account preferences, privacy controls, and trusted
              review experience from one place.
            </p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a7c8e6]">
                Signed in as
              </p>
              <p className="mt-2 truncate text-sm font-bold text-white">
                {user?.name || "TRUSIQ member"}
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_20px_55px_rgba(18,48,74,0.08)] sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                Preferences
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                {isAdmin
                  ? "Governance and safeguards"
                  : isOwner
                    ? "Business preferences"
                    : "How TRUSIQ keeps you informed"}
              </h2>
              <div className="mt-7 divide-y divide-[#edf2f7]">
                <SettingRow
                  icon="bi-envelope-check"
                  title="Email alerts"
                  description="Receive important updates about reviews and account activity."
                  enabled={emailAlerts}
                  onToggle={() => setEmailAlerts((value) => !value)}
                />
                <SettingRow
                  icon="bi-geo-alt"
                  title="Location verification"
                  description="Use your location when scanning a business QR code for a verified visit."
                  enabled={locationVerification}
                  onToggle={() => setLocationVerification((value) => !value)}
                />
                {isAdmin && (
                  <>
                    <SettingRow
                      icon="bi-person-check"
                      title="Require reviewer verification"
                      description="Keep QR, identity, and location checks enabled for every review."
                      enabled={true}
                      onToggle={() => undefined}
                    />
                    <SettingRow
                      icon="bi-database-lock"
                      title="Audit logging"
                      description="Record moderation and account actions for platform accountability."
                      enabled={true}
                      onToggle={() => undefined}
                    />
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={savePreferences}
                className="mt-7 rounded-xl bg-gradient-to-r from-[#12304a] via-[#1b4068] to-[#2f68f1] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(47,104,241,0.2)] transition hover:-translate-y-0.5"
              >
                {saved ? "Preferences saved" : "Save preferences"}
              </button>
            </div>

            <div className="rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_20px_55px_rgba(18,48,74,0.08)] sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                Security
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">
                {isAdmin ? "Administrator protection" : "Account protection"}
              </h2>
              <div className="mt-6 flex items-start gap-4 rounded-2xl bg-[#f4f9fc] p-4">
                <i
                  className="bi bi-shield-check mt-1 text-xl text-[#2f68f1]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-black">Automatic session timeout</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#647b8b]">
                    {isAdmin
                      ? "Administrator sessions expire after 10 minutes of inactivity and use a shorter server token lifetime."
                      : "For your protection, inactive sessions are signed out after 10 minutes."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
                className="mt-6 rounded-xl border border-[#f3caca] bg-[#fff5f5] px-5 py-3 text-sm font-black text-[#a63636] transition hover:bg-[#ffe9e9]"
              >
                Sign out everywhere
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SettingRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div className="flex min-w-0 items-start gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-[#2f68f1]">
          <i className={`bi ${icon}`} aria-hidden="true" />
        </div>
        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#647b8b]">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={`${title}: ${enabled ? "on" : "off"}`}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-[#2f68f1]" : "bg-[#d7e2ec]"}`}
      >
        <span
          className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}

export default SettingsPage;
