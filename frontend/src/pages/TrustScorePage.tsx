import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function TrustScorePage() {
  const [data, setData] = useState<any | null>(null);
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

  const score = data?.score ?? 8.4;
  const percentile = data?.percentile ?? 95;
  const metrics = data?.metrics ?? {
    reviewAuthenticity: 94,
    verificationLevel: 85,
    customerSentiment: 78,
    businessActivity: 92,
  };
  const trajectory: number[] = data?.trajectory ?? [72, 74, 76, 79, 82];

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell mx-auto max-w-[920px] px-4 py-8">
        <header className="mb-6 flex items-center gap-4">
          <Link to="/" className="-mr-2 p-2 text-[#12304a]">
            <i className="bi bi-arrow-left text-2xl" aria-hidden="true" />
          </Link>
          <h1 id="trust-title" className="text-xl font-black">
            Trust Score Analysis
          </h1>
        </header>

        <main role="main" aria-labelledby="trust-title" className="grid gap-6">
          {/* Score card */}
          <section
            role="region"
            aria-labelledby="trust-score-heading"
            className="rounded-2xl bg-white p-6 shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-[#657b8b]">
                BLOCKCHAIN VERIFIED
              </div>
              <div className="text-xs rounded-full border border-[#e6f0fb] bg-[#eef6ff] px-3 py-1 text-[#1b6fcf] font-black">
                Top {percentile}%
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div
                  id="trust-score-heading"
                  className="text-6xl font-black text-[#1b6fcf]"
                >
                  {score}
                </div>
                <div className="mt-1 text-sm uppercase text-[#657b8b]">
                  Exceptional trust
                </div>
              </div>

              <div className="w-32" aria-hidden="false">
                <svg
                  viewBox="0 0 36 36"
                  className="h-20 w-20"
                  role="img"
                  aria-labelledby="trust-graphic-title trust-graphic-desc"
                >
                  <title id="trust-graphic-title">Trust score radial</title>
                  <desc id="trust-graphic-desc">
                    Radial indicator showing an 8.4 trust score.
                  </desc>
                  <path
                    d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                    fill="#eaf6ff"
                  />
                  <path
                    d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                    stroke="#1b6fcf"
                    strokeWidth="2"
                    strokeDasharray="80 100"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </section>

          {/* Detailed breakdown */}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-black">Detailed Breakdown</h2>
            <div className="grid gap-4">
              {[
                ["Review Authenticity", metrics.reviewAuthenticity],
                ["Verification Level", metrics.verificationLevel],
                ["Customer Sentiment", metrics.customerSentiment],
                ["Business Activity", metrics.businessActivity],
              ].map(([label, value]) => (
                <div key={String(label)} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-[#657b8b]">
                    <span>{label}</span>
                    <span className="font-black">{value}/100</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Number(value)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${value} out of 100`}
                    className="h-2 w-full rounded-full bg-[#eef6ff]"
                  >
                    <div
                      className="h-2 rounded-full bg-[#1b6fcf]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trust trajectory chart placeholder */}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-black">Trust Trajectory</h2>
            <div
              role="img"
              aria-label="Trust trajectory over the last 5 months: 72, 74, 76, 79, 82"
              className="h-40 w-full rounded-lg border border-dashed border-[#e6eef6] bg-gradient-to-b from-white to-[#fbfdff] p-4"
            >
              <div className="flex h-full items-end gap-2">
                {trajectory.map((v: number, i: number) => (
                  <div key={i} className="flex-1" aria-hidden="false">
                    <div
                      className="mx-auto h-full rounded-t-md bg-[#1b6fcf]"
                      style={{
                        height: `${(v / 100) * 100}%`,
                        maxHeight: "100%",
                      }}
                      aria-label={`Month ${i + 1}: ${v}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Immutable trust audit + AI insight */}
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl bg-[#0f2331] p-6 text-white shadow-md">
              <h3 className="mb-2 text-sm font-black">SECURED VIA POLYGON</h3>
              <p className="mb-3 text-sm text-[#c6dff6]">
                Immutable Trust Audit
              </p>
              <div className="rounded-md bg-[#0b1a26] p-3 text-xs">
                TX: 0x8a3f...9e21 | Verified at block #42,891,012
              </div>
              <p className="mt-3 text-sm text-[#c6dff6]">
                This business profile is cryptographically signed. Scores are
                recalculated daily using decentralized AI nodes to ensure zero
                manipulation.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-2 text-sm font-black">AI Analysis Insight</h3>
              <p className="text-sm text-[#657b8b]">
                Overall score increased by +0.6 this month due to improved
                verification tiers and high-quality voice review submissions.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-sm text-[#1b6fcf]">
                  High Authenticity
                </span>
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-sm text-[#1b6fcf]">
                  Verified Vendor
                </span>
              </div>
            </section>
          </div>

          <footer className="mt-2">
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h3 className="mb-2 text-sm font-black">What this means</h3>
              <p className="text-sm text-[#657b8b]">
                The Trust Score is a proprietary calculation based on
                engagement, verification, and AI-driven sentiment analysis. It
                does not constitute a financial endorsement.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default TrustScorePage;
