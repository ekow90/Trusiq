import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";

type AdminData = {
  stats: {
    users: string;
    businesses: string;
    reviews: string;
    reports: string;
  };
  verificationRequests: {
    id: string;
    status: string;
    submitted_at: string;
    business_name: string;
  }[];
  users: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    role: string;
    account_status: string;
    email_verified: boolean;
    company_id: string | null;
  }[];
};
export function AdminPanel() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  useEffect(() => {
    fetch("/api/stats/admin", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Could not load admin data");
        setData(body);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [token]);
  async function updateVerification(
    id: string,
    status: "verified" | "rejected",
  ) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/companies/admin/verification/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Could not update request");
      setData((current) =>
        current
          ? {
              ...current,
              verificationRequests: current.verificationRequests.filter(
                (request) => request.id !== id,
              ),
            }
          : current,
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update request",
      );
    } finally {
      setUpdatingId("");
    }
  }
  const statItems = data
    ? [
        { label: "Users", value: data.stats.users },
        { label: "Businesses", value: data.stats.businesses },
        { label: "Reviews", value: data.stats.reviews },
        { label: "Reports", value: data.stats.reports },
      ]
    : [];
  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:px-8">
      <div className="mx-auto max-w-[1100px]">
        <header className="flex items-center justify-between rounded-[28px] bg-white/85 px-5 py-4 shadow-[0_16px_35px_rgba(18,48,74,0.08)]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
              Platform admin
            </p>
            <h1 className="text-2xl font-black">Admin panel</h1>
          </div>
          <Link
            to="/settings"
            className="rounded-full border border-[#12304a]/20 bg-[#12304a] px-4 py-2 text-sm font-black text-white shadow-[0_8px_18px_rgba(18,48,74,0.18)] transition hover:bg-[#1b4068]"
          >
            Settings
          </Link>
        </header>
        {error && (
          <p className="mt-6 rounded-xl bg-[#fff3f3] p-4 text-sm font-semibold text-[#a63636]">
            {error}
          </p>
        )}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[24px] border border-[#dfeaf6] bg-white p-5 shadow-[0_18px_45px_rgba(18,48,74,0.06)]"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7d97ad]">
                {stat.label}
              </p>
              <p className="mt-4 text-4xl font-black">{stat.value}</p>
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_70px_rgba(18,48,74,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Pending verification requests
            </h2>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black text-[#2f68f1]">
              {data?.verificationRequests.length || 0}
            </span>
          </div>
          {!data ? (
            <p className="mt-8 text-[#647b8b]">Loading live admin data...</p>
          ) : data.verificationRequests.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[#cbdbea] p-8 text-center font-semibold text-[#647b8b]">
              No pending verification requests.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.verificationRequests.map((request) => (
                <article
                  key={request.id}
                  className="flex items-center justify-between rounded-2xl bg-[#f8fbff] p-4"
                >
                  <div>
                    <p className="font-black">{request.business_name}</p>
                    <p className="mt-1 text-sm text-[#647b8b]">
                      Submitted{" "}
                      {new Date(request.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff4dc] px-3 py-1 text-xs font-black uppercase text-[#b86a00]">
                    {request.status}
                  </span>
                  <div className="ml-3 flex gap-2">
                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() => updateVerification(request.id, "verified")}
                      className="rounded-full border border-[#0f7a57]/20 bg-[#0f7a57] px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#0d694a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === request.id}
                      onClick={() => updateVerification(request.id, "rejected")}
                      className="rounded-full border border-[#a63636]/20 bg-[#a63636] px-3 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#8d2d2d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_70px_rgba(18,48,74,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Users</h2>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black text-[#2f68f1]">
              {data?.users.length || 0}
            </span>
          </div>

          {!data ? (
            <p className="mt-8 text-[#647b8b]">Loading user directory...</p>
          ) : data.users.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[#cbdbea] p-8 text-center font-semibold text-[#647b8b]">
              No users found.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {data.users.map((user) => {
                const normalizedRoles = Array.isArray(user.roles)
                  ? user.roles
                  : [user.role || "customer"];
                return (
                  <article
                    key={user.id}
                    className="rounded-2xl bg-[#f8fbff] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-black">{user.name}</p>
                        <p className="mt-1 text-sm text-[#647b8b]">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#dfeaf6] bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#12304a]">
                          {normalizedRoles.join(", ") || "customer"}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                            user.account_status === "active"
                              ? "border-[#cceadf] bg-[#eaf7f0] text-[#0f7a57]"
                              : "border-[#f3caca] bg-[#ffe9e9] text-[#a63636]"
                          }`}
                        >
                          {user.account_status || "active"}
                        </span>
                        {user.email_verified ? (
                          <span className="rounded-full border border-[#dfeaf6] bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#12304a]">
                            Verified
                          </span>
                        ) : (
                          <span className="rounded-full border border-[#f3d7a1] bg-[#fff4dc] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#8a5a00]">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
export default AdminPanel;
