import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type CompanyProfile = {
  id: string;
  name: string;
  category: string;
  location: string;
  slug: string;
  trustScore: number;
  rating: number;
  reviewsCount: number;
  description: string;
  website?: string;
  phone?: string;
};

export function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [business, setBusiness] = useState<CompanyProfile | null>(null);
  const [summary, setSummary] = useState<string>(
    "No reviews have been submitted yet. Once customer feedback is added, AI trust insights will appear here.",
  );
  const [summaryHighlights, setSummaryHighlights] = useState<string[]>([
    "Add verified customer reviews to unlock live sentiment analysis.",
  ]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskFlags, setRiskFlags] = useState<string[]>([
    "No review data available yet.",
  ]);

  useEffect(() => {
    async function loadBusiness() {
      if (!slug) return;

      try {
        const response = await fetch(`/api/companies/${slug}`);
        if (!response.ok) {
          setBusiness(null);
          return;
        }

        const data = await response.json();
        const company: CompanyProfile = {
          id: data.company.id,
          name: data.company.name,
          category: data.company.category || "General",
          location: data.company.location || "Location not provided",
          slug: data.company.slug,
          trustScore: Number(data.company.trustScore || 0),
          rating: Number(data.company.rating || 0),
          reviewsCount: Number(data.company.reviewsCount || 0),
          description:
            data.company.description || "No business description yet.",
          website: data.company.website || "",
          phone: data.company.phone || "",
        };

        setBusiness(company);

        if (!company.reviewsCount) {
          setSummary(
            "No reviews have been submitted yet. Once customer feedback is added, AI trust insights will appear here.",
          );
          setSummaryHighlights([
            "Add verified customer reviews to unlock live sentiment analysis.",
          ]);
          setRiskScore(0);
          setRiskFlags(["No review data available yet."]);
          return;
        }

        const payload = { reviews: [] };
        const summaryResponse = await fetch("/api/ai/review-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const summaryJson = await summaryResponse.json();
        if (summaryJson.summary) setSummary(summaryJson.summary);
        if (Array.isArray(summaryJson.highlights))
          setSummaryHighlights(summaryJson.highlights);

        const detectorResponse = await fetch("/api/ai/fake-review-detector", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const detectorJson = await detectorResponse.json();
        if (typeof detectorJson.riskScore === "number")
          setRiskScore(detectorJson.riskScore);
        if (Array.isArray(detectorJson.flags)) setRiskFlags(detectorJson.flags);
      } catch (error) {
        setBusiness(null);
      }
    }

    void loadBusiness();
  }, [slug]);

  if (!business) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell min-h-screen overflow-visible">
        <header className="border-b border-[#d8e6ef] bg-[#f4f9fc]/95 backdrop-blur lg:sticky lg:top-0 lg:z-20">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <Link
              className="grid size-10 place-items-center rounded-xl text-xl text-[#12304a] transition hover:bg-white"
              to="/search"
              aria-label="Back to search"
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </Link>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                Profile
              </p>
              <h1 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                {business.name}
              </h1>
            </div>
            <span className="size-10" />
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <section className="grid gap-8">
              <div className="overflow-hidden rounded-[32px] border border-[#d8e6ef] bg-white shadow-[0_24px_80px_rgba(18,48,74,0.08)]">
                <div
                  className="relative h-[280px] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80')",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12304a]/90 via-[#12304a]/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1240px] items-end justify-between gap-6 px-5 pb-5 sm:px-8">
                    <div className="-mt-14 flex items-end gap-5">
                      <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-white bg-white text-4xl font-black text-[#12304a] shadow-lg">
                        {business.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="text-white">
                        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-sm">
                          Live profile
                        </span>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                          {business.name}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-base">
                          {business.category} • {business.location}
                        </p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-3 rounded-full bg-white/90 px-4 py-3 shadow-sm sm:flex">
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#12304a] text-white transition hover:bg-[#1f4b70]"
                        aria-label="Call company"
                      >
                        <i className="bi bi-telephone" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff] text-[#12304a] transition hover:bg-[#eef4ff]"
                        aria-label="Visit website"
                      >
                        <i className="bi bi-globe" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
                  <div className="grid gap-4 rounded-[28px] bg-[#eff5ff] p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2f68f1]">
                        Trust score
                      </p>
                      <h3 className="mt-3 text-[56px] font-black tracking-[-0.06em] text-[#12304a]">
                        {business.trustScore}
                      </h3>
                      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#2f68f1]">
                        {business.trustScore >= 80
                          ? "Strong confidence"
                          : "Growing trust"}
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                        Rating
                      </p>
                      <p className="mt-3 text-3xl font-black text-[#12304a]">
                        {business.rating || 0}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#657b8b]">
                        {business.reviewsCount} reviews
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                          AI business summary
                        </p>
                        <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#12304a]">
                          Reputation insights at a glance
                        </h3>
                      </div>
                      <span className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-black text-[#2f68f1]">
                        {business.trustScore >= 80
                          ? "Strong confidence"
                          : "Growing trust"}
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-semibold leading-7 text-[#5b6c7b]">
                      {summary}
                    </p>
                    {summaryHighlights.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-[#4b647a]">
                        {summaryHighlights.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <i
                              className="bi bi-stars mt-0.5 text-[#2f68f1]"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rounded-[28px] bg-[#fffaf5] p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)] border border-[#f8e7d8]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b86d2c]">
                          AI fake review detector
                        </p>
                        <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#12304a]">
                          Review authenticity risk
                        </h3>
                      </div>
                      <div className="rounded-full bg-[#fff3e8] px-3 py-2 text-lg font-black text-[#b86d2c]">
                        {riskScore ?? 0}%
                      </div>
                    </div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#f9e3cb]">
                      <div
                        className="h-full rounded-full bg-[#b86d2c] transition-all"
                        style={{ width: `${Math.min(100, riskScore ?? 0)}%` }}
                      />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-[#4b647a]">
                      {riskFlags.length > 0 ? (
                        riskFlags.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <i
                              className="bi bi-shield-exclamation mt-0.5 text-[#b86d2c]"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2">
                          <i
                            className="bi bi-shield-check mt-0.5 text-[#2f68f1]"
                            aria-hidden="true"
                          />
                          <span>No obvious fake-review patterns detected.</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                        Reputation insights
                      </p>
                      <h4 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                        Business highlights
                      </h4>
                      <ul className="mt-5 space-y-3">
                        <li className="flex items-center gap-3 rounded-2xl bg-[#f4f9fc] px-4 py-3 text-sm font-semibold text-[#12304a]">
                          <i
                            className="bi bi-check-circle-fill text-[#2f68f1]"
                            aria-hidden="true"
                          />
                          {business.description}
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                        Reputation alerts
                      </p>
                      <h4 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                        Review status
                      </h4>
                      <ul className="mt-5 space-y-3">
                        <li className="flex items-center gap-3 rounded-2xl border border-[#fdecea] bg-[#fff3f5] px-4 py-3 text-sm font-semibold text-[#ad1f31]">
                          <i
                            className="bi bi-exclamation-circle-fill"
                            aria-hidden="true"
                          />
                          {business.reviewsCount > 0
                            ? "Reviews are being monitored for authenticity."
                            : "No customer reviews available yet."}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <section className="rounded-[32px] border border-[#d8e6ef] bg-white px-5 py-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)] sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                      Verified reviews
                    </p>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#12304a]">
                      Customer feedback
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["All", "Latest", "Highest", "Lowest"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className="rounded-full border border-[#d8e6ef] bg-[#f8fbff] px-4 py-2 text-xs font-black text-[#12304a] transition hover:border-[#12304a] hover:bg-white"
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  <div className="rounded-[28px] border border-[#e3ebf3] bg-[#fafcff] p-6 text-sm font-semibold text-[#5b6c7b]">
                    No customer reviews have been submitted for this business
                    yet. Once reviews are added, they will appear here with
                    trust and authenticity analysis.
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[28px] bg-[#f4f9fc] px-5 py-4 text-sm font-semibold text-[#12304a] shadow-sm">
                  <p>
                    {business.reviewsCount} reviews · {business.rating || 0}{" "}
                    average
                  </p>
                  <button
                    type="button"
                    className="rounded-full bg-[#12304a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1f4b70]"
                  >
                    Leave review
                  </button>
                </div>
              </section>
            </section>

            <aside className="space-y-6 lg:sticky lg:top-8">
              <div className="rounded-[28px] border border-[#d8e6ef] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                  Business details
                </p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[24px] bg-[#f4f9fc] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                      Business description
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#12304a]">
                      {business.description}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#f4f9fc] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#12304a]">
                      {business.location}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#f4f9fc] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                      Website
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#12304a]">
                      {business.website || "Not provided yet"}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-[#f4f9fc] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                      Phone
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#12304a]">
                      {business.phone || "Not provided yet"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#d8e6ef] bg-[#eef4ff] p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2f68f1]">
                  Profile actions
                </p>
                <h3 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                  Keep your profile fresh
                </h3>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#12304a]/80">
                  Share verified data and invite customers to leave high-trust
                  reviews.
                </p>
                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#12304a] px-5 text-sm font-black text-white transition hover:bg-[#1f4b70]"
                  >
                    Send invite
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-[#d8e6ef] bg-white text-sm font-black text-[#12304a] transition hover:border-[#12304a] hover:text-[#12304a]"
                  >
                    Update verification
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
