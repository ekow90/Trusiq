import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth";

type TrustScoreData = {
  message?: string;
  score?: number;
  percentile?: number;
  metrics?: {
    reviewAuthenticity: number;
    verificationLevel: number;
    customerSentiment: number;
    businessActivity: number;
  };
  trajectory?: number[];
};

export function TrustScorePage() {
  const [data, setData] = useState<TrustScoreData | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    let active = true;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/trust", { headers })
      .then((res) => res.json())
      .then((json) => {
        if (active) setData(json);
      })
      .catch(() => {
        /* ignore for now */
      });

    return () => {
      active = false;
    };
  }, [token]);

  const score = data?.score ?? 0;
  const percentile = data?.percentile ?? 0;
  const metrics = data?.metrics ?? {
    reviewAuthenticity: 0,
    verificationLevel: 0,
    customerSentiment: 0,
    businessActivity: 0,
  };
  const trajectory: number[] = data?.trajectory ?? [];

  return (
    <div className="min-h-screen bg-[#edf5fb] text-[#12304a]">
      <div className="mx-auto max-w-[940px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-white/80 px-4 py-3 shadow-[0_16px_35px_rgba(18,48,74,0.08)] backdrop-blur-sm">
          <Link
            to="/"
            className="flex size-11 items-center justify-center rounded-full border border-[#dfeaf5] bg-[#f7fafc] text-lg font-black text-[#12304a] shadow-sm transition hover:-translate-x-0.5 hover:shadow-md"
            aria-label="Go back"
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
          </Link>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
              Trust analysis
            </p>
            <h1
              id="trust-title"
              className="text-2xl font-black tracking-[-0.05em]"
            >
              Trust Score
            </h1>
          </div>
          <div className="grid size-11 place-items-center rounded-full border border-[#dfeaf5] bg-[#eef4ff] text-[#2f68f1] shadow-sm">
            <i className="bi bi-info-circle" aria-hidden="true" />
          </div>
        </header>

        <main role="main" aria-labelledby="trust-title" className="space-y-6">
          <section
            role="region"
            aria-labelledby="trust-score-heading"
            className="relative overflow-hidden rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_30px_80px_rgba(18,48,74,0.08)] sm:p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,165,255,0.18),_transparent_35%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                  Secured via Polygon
                </div>
                <div className="rounded-full border border-[#dfeaf6] bg-[#eef6ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2563eb]">
                  Top {percentile}% in category
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[12px] border-[#dfeaf6] bg-gradient-to-br from-white to-[#f4f9ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_50px_rgba(37,99,235,0.12)]">
                    <div className="absolute inset-[12px] rounded-full border-[10px] border-[#2563eb] border-t-transparent" />
                    <div className="relative text-center">
                      <div
                        id="trust-score-heading"
                        className="text-6xl font-black tracking-[-0.07em] text-[#12304a]"
                      >
                        {score.toFixed(1)}
                      </div>
                      <div className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                        {score > 0
                          ? score >= 80
                            ? "Strong"
                            : "Building"
                          : "No data yet"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-md text-center sm:text-left">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#2f68f1]">
                    Verified score
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#12304a]">
                    Trust beyond star ratings
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#5d7290]">
                    {data?.message ||
                      "Trust data will appear here as reviews, verification, and business activity are recorded."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-6">
            <h2 className="mb-5 text-2xl font-black tracking-[-0.05em] text-[#12304a]">
              Detailed breakdown
            </h2>
            <div className="space-y-5">
              {[
                ["Review Authenticity", metrics.reviewAuthenticity],
                ["Verification Level", metrics.verificationLevel],
                ["Customer Sentiment", metrics.customerSentiment],
                ["Business Activity", metrics.businessActivity],
              ].map(([label, value]) => (
                <div key={String(label)} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-black text-[#12304a]">
                    <span>{label}</span>
                    <span className="text-[#2f68f1]">{value}/100</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#edf4ff]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563eb] via-[#2f68f1] to-[#7ab3ff] shadow-[0_12px_20px_rgba(47,104,241,0.25)]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-6">
            <h2 className="mb-5 text-2xl font-black tracking-[-0.05em] text-[#12304a]">
              Trust trajectory
            </h2>
            <div className="rounded-[24px] border border-[#edf2f8] bg-[#f9fbff] p-4">
              <div className="flex h-48 items-end gap-3">
                {trajectory.length ? (
                  trajectory.map((value, index) => (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className="w-full rounded-t-[16px] bg-gradient-to-t from-[#1b6fcf] to-[#6ea9ff] shadow-[0_16px_25px_rgba(37,99,235,0.2)]"
                        style={{ height: `${(value / 100) * 100}%` }}
                        aria-label={`Month ${index + 1}: ${value}`}
                      />
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7d97ad]">
                        {["Jan", "Feb", "Mar", "Apr", "May"][index]}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="flex h-48 items-center justify-center text-sm font-semibold text-[#647b8b]">
                    No trust history yet.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-[30px] bg-gradient-to-br from-[#0f2331] via-[#12304a] to-[#1d3d67] p-5 text-white shadow-[0_28px_70px_rgba(18,48,74,0.24)] sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-200">
                Trust integrity
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-[-0.05em]">
                Transparent trust audit
              </h3>
              <div className="mt-5 rounded-[18px] border border-white/10 bg-[#0b1a26]/60 p-3 text-xs font-semibold text-sky-100">
                Blockchain anchoring is planned, not active
              </div>
              <p className="mt-4 text-sm leading-7 text-sky-100">
                Scores are calculated from the current database signals.
                Government registration contributes only after an administrator
                approves the submitted documents.
              </p>
            </section>

            <section className="rounded-[30px] border border-[#dfeaf6] bg-white p-5 shadow-[0_24px_70px_rgba(18,48,74,0.08)] sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                AI analysis insight
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#12304a]">
                What changed
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#5d7290]">
                Trust insights will appear after this business has enough real
                activity to analyse.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2563eb]">
                  High authenticity
                </span>
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2563eb]">
                  Verified vendor
                </span>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TrustScorePage;
