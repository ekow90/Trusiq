import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const activityFeed = [
  {
    title: "Blue Horizon Tech Solutions",
    status: "Published",
    meta: "2 days ago",
    rating: 5,
    review: "Amazing service and complete transparency on the pricing model.",
  },
  {
    title: "The Organic Bean Cafe",
    status: "Pending",
    meta: "1 week ago",
    rating: 4,
    review:
      "Great coffee, but the wait times can be a bit long during peak hours.",
  },
  {
    title: "FastTrack Logistics",
    status: "Flagged",
    meta: "Feb 12, 2024",
    rating: 2,
    review:
      "Multiple delays without notification. Reported for inaccurate delivery windows.",
  },
];

const summaryCards = [
  { label: "Reviews", value: 24 },
  { label: "Impact", value: "1.2k" },
  { label: "Saved", value: 12 },
];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isOwner = user.roles.includes("owner");
  const isCustomer = user.roles.includes("customer");

  return (
    <div className="min-h-screen bg-[#edf5fb] text-[#12304a]">
      <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-white/80 px-4 py-3 shadow-[0_16px_35px_rgba(18,48,74,0.08)] backdrop-blur-sm sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[#0f2138] text-lg font-black text-white shadow-[0_12px_25px_rgba(18,48,74,0.2)]">
              <i className="bi bi-lightning-charge" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                Activity
              </p>
              <h1 className="text-2xl font-black tracking-[-0.05em]">
                My activity
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-[#dfeaf5] bg-[#f7fafc] text-[#12304a] shadow-sm transition hover:shadow-md"
            aria-label="Notifications"
          >
            <i className="bi bi-bell" />
          </button>
        </header>

        <main className="rounded-[30px] border border-[#dfeaf6] bg-white p-4 shadow-[0_30px_80px_rgba(18,48,74,0.08)] sm:p-6">
          <section className="rounded-[24px] bg-gradient-to-r from-[#edf5ff] via-[#edf6ff] to-[#f3f9ff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-[#dbeafe] to-[#cfe4ff] text-xl font-black text-[#1e3a5f] shadow-[0_14px_28px_rgba(37,99,235,0.2)]">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-[-0.05em] text-[#12304a]">
                    {user.name || "Alex Johnson"}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#dbe8f4] bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
                    <i className="bi bi-shield-check" /> Verified
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-[#5d7190]">
                  Verified Trust Contributor
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#dfeaf5]">
                    <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-[#2563eb] to-[#2f68f1]" />
                  </div>
                  <span className="text-sm font-black text-[#12304a]">85%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[18px] border border-[#dfeaf6] bg-white/70 p-3 text-center shadow-sm"
                >
                  <p className="text-2xl font-black tracking-[-0.05em] text-[#12304a]">
                    {card.value}
                  </p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#7d97ad]">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Reviews", "Saved", "Reports", "Account"].map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => tab === "Account" && navigate("/settings")}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  index === 0
                    ? "bg-[#2f68f1] text-white shadow-[0_12px_24px_rgba(47,104,241,0.25)]"
                    : "border border-[#dfeaf6] bg-[#f8fbff] text-[#5d7290] hover:bg-[#eef4ff]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-[-0.05em]">
                Recently submitted
              </h3>
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
                {activityFeed.length} items
              </span>
            </div>

            <div className="space-y-4">
              {activityFeed.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[22px] border border-[#dfeaf6] bg-[#fbfdff] p-4 shadow-[0_12px_30px_rgba(18,48,74,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(18,48,74,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-black text-[#12304a]">
                        <span className="text-lg text-[#2f68f1]">★</span>
                        <span>{item.title}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#6a7f94]">
                        {[...Array(5)].map((_, starIndex) => (
                          <span
                            key={starIndex}
                            className={
                              starIndex < item.rating
                                ? "text-[#f4b740]"
                                : "text-[#dfeaf6]"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span>• {item.meta}</span>
                      </div>
                      <p className="mt-3 text-base leading-7 text-[#456078]">
                        {item.review}
                      </p>
                    </div>
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                        item.status === "Published"
                          ? "bg-[#eaf7f0] text-[#0f9d6f]"
                          : item.status === "Pending"
                            ? "bg-[#fef3d8] text-[#b86a00]"
                            : "bg-[#fde8e8] text-[#d92d2d]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#edf2f8] pt-3">
                    <div className="flex gap-3 text-sm font-semibold text-[#5d7290]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 transition hover:text-[#12304a]"
                      >
                        <i className="bi bi-pencil-square" /> Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 transition hover:text-[#12304a]"
                      >
                        <i className="bi bi-trash" /> Delete
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-[#edf4ff] px-3 py-2 text-sm font-black text-[#2f68f1] transition hover:bg-[#e0ecff]"
                    >
                      View full <i className="bi bi-arrow-right" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {isOwner && (
            <section className="mt-8 rounded-[26px] bg-gradient-to-br from-[#0f2331] via-[#12304a] to-[#17395f] p-5 text-white shadow-[0_28px_70px_rgba(18,48,74,0.25)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-200">
                    Owner hub
                  </p>
                  <h3 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                    Invite customers to review
                  </h3>
                </div>
                <Link
                  to="/trust-score"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-[#12304a] shadow-[0_16px_28px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5"
                >
                  View analytics
                </Link>
              </div>
            </section>
          )}

          {isCustomer && (
            <section className="mt-8 rounded-[26px] border border-[#dfeaf6] bg-[#f8fbff] p-5 shadow-[0_14px_30px_rgba(18,48,74,0.05)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                    Smart actions
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#12304a]">
                    Continue discovering trusted businesses
                  </h3>
                </div>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#2f68f1] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(47,104,241,0.2)] transition hover:-translate-y-0.5"
                >
                  Search now
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
