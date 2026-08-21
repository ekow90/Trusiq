import { Link } from "react-router-dom";

const stats = [
  { label: "Users", value: "12.4k", tone: "bg-[#eef4ff] text-[#2563eb]" },
  { label: "Businesses", value: "2.8k", tone: "bg-[#eafaf4] text-[#10b981]" },
  { label: "Reviews", value: "48.1k", tone: "bg-[#fff4dc] text-[#f59e0b]" },
  { label: "Reports", value: "312", tone: "bg-[#feecec] text-[#ef4444]" },
];

const pendingRequests = [
  { name: "North & Co", type: "Verification", risk: "Low" },
  { name: "Aster Labs", type: "Flagged review", risk: "Medium" },
  { name: "Summit Housing", type: "Scam report", risk: "High" },
];

export function AdminPanel() {
  return (
    <div className="min-h-screen bg-[#edf5fb] text-[#12304a]">
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-white/80 px-4 py-3 shadow-[0_16px_35px_rgba(18,48,74,0.08)] backdrop-blur-sm sm:px-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
              Platform admin
            </p>
            <h1 className="text-2xl font-black tracking-[-0.05em]">
              Admin Panel
            </h1>
          </div>
          <button
            type="button"
            className="rounded-full bg-[#12304a] px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(18,48,74,0.18)] transition hover:-translate-y-0.5"
          >
            Live mode
          </button>
        </header>

        <main className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[26px] border border-[#dfeaf6] bg-white p-5 shadow-[0_20px_45px_rgba(18,48,74,0.06)] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(18,48,74,0.1)]"
              >
                <div
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${stat.tone}`}
                >
                  {stat.label}
                </div>
                <p className="mt-4 text-4xl font-black tracking-[-0.06em] text-[#12304a]">
                  {stat.value}
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-[-0.05em]">
                  Verification requests
                </h2>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2563eb]">
                  12 pending
                </span>
              </div>

              <div className="space-y-3">
                {pendingRequests.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-[20px] border border-[#edf2f8] bg-[#fafcff] p-4 transition hover:border-[#d9e7ff] hover:bg-[#f4f9ff]"
                  >
                    <div>
                      <p className="text-lg font-black text-[#12304a]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-[#647b8d]">{item.type}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                        item.risk === "High"
                          ? "bg-[#fde8e8] text-[#d92d2d]"
                          : item.risk === "Medium"
                            ? "bg-[#fff4dc] text-[#d97706]"
                            : "bg-[#eafaf4] text-[#10b981]"
                      }`}
                    >
                      {item.risk}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-[#dfeaf6] bg-gradient-to-br from-[#0f2331] via-[#12304a] to-[#17395f] p-5 text-white shadow-[0_28px_70px_rgba(18,48,74,0.25)] sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-200">
                Moderation
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
                Flagged content
              </h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>Fake-review cluster</span>
                    <span className="text-[#ffd166]">18</span>
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>Scam reports</span>
                    <span className="text-[#fca5a5]">27</span>
                  </div>
                </div>
              </div>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-black text-[#12304a] shadow-[0_16px_28px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5"
              >
                View all alerts
              </Link>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
