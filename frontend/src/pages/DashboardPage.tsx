import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

type Review = {
  id: string;
  business_name: string;
  slug: string;
  rating: number;
  review_text: string;
  verified_visit: boolean;
  review_status: string;
  created_at: string;
};
type OwnerAnalytics = {
  business: {
    business_name: string;
    verification_level: string;
    trust_score: number;
    rating: number;
    verificationStatus: string;
    scoreBreakdown?: {
      factors: {
        reviews: number;
        reviewAuthenticity: number;
        customerSentiment: number;
        governmentRegistration: number;
      };
    };
  };
  totals: {
    reviews: number;
    verifiedReviews: number;
    verifiedPercentage: number;
    positive: number;
    negative: number;
  };
  analysis: {
    summary: string;
    sentiment: string;
    highlights: string[];
    riskScore: number;
    health: {
      status: string;
      problem: string;
      reason: string;
      recommendation: string;
      expectedBenefit: string;
    };
  };
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  useEffect(() => {
    fetch("/api/auth/activity", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((body) => setReviews(body.reviews || []))
      .catch(() => setReviews([]));
  }, [token]);
  useEffect(() => {
    if (!user?.roles.includes("owner")) return;
    const loadingTask = window.setTimeout(() => setAnalyticsLoading(true), 0);
    fetch("/api/companies/owner/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((body) => {
        if (!body.business)
          throw new Error(body.error || "Business analytics are unavailable");
        setAnalytics(body);
      })
      .catch((reason: Error) => {
        setAnalytics(null);
        setAnalyticsError(reason.message);
      })
      .finally(() => setAnalyticsLoading(false));
    return () => window.clearTimeout(loadingTask);
  }, [token, user]);
  if (!user) return null;
  const isOwner = user.roles.includes("owner");
  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:px-6">
      <div className="mx-auto max-w-[900px]">
        <header className="flex items-center justify-between rounded-[28px] bg-white/85 px-5 py-4 shadow-[0_16px_35px_rgba(18,48,74,0.08)]">
          <Link
            to="/"
            className="grid size-10 place-items-center rounded-full bg-[#12304a] text-white"
          >
            <i className="bi bi-lightning-charge" />
          </Link>
          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
              {isOwner ? "Business dashboard" : "Customer dashboard"}
            </p>
            <h1 className="text-2xl font-black">My activity</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="grid size-10 place-items-center rounded-full border border-[#dfeaf6] bg-white shadow-sm"
            aria-label="Notifications"
          >
            <i className="bi bi-bell" />
          </button>
        </header>
        <section className="mt-6 rounded-[30px] bg-[#12304a] p-6 text-white shadow-[0_25px_70px_rgba(18,48,74,0.2)] sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-full bg-white/15 text-2xl font-black">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-3xl font-black">{user.name}</h2>
              <p className="mt-1 text-sm font-semibold text-[#c6ddef]">
                {isOwner ? "Business owner" : "Customer"}
              </p>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-3">
            <Metric
              label={isOwner ? "Trust score" : "Reviews"}
              value={
                isOwner
                  ? Number(analytics?.business.trust_score || 0)
                  : reviews.length
              }
            />
            <Metric
              label={isOwner ? "Rating" : "Verified"}
              value={
                isOwner
                  ? Number(analytics?.business.rating || 0)
                  : reviews.filter((review) => review.verified_visit).length
              }
            />
            <Metric
              label={isOwner ? "Reviews" : "Impact"}
              value={
                isOwner
                  ? Number(analytics?.totals.reviews || 0)
                  : reviews.length
              }
            />
          </div>
        </section>
        <nav className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-[#12304a] px-4 py-2 text-sm font-black text-white shadow-sm"
          >
            Reviews
          </button>
          <Link
            to="/settings"
            className="rounded-full border border-[#bfd3ff] bg-[#eef4ff] px-4 py-2 text-sm font-black text-[#12304a] shadow-sm transition hover:bg-[#e3edff]"
          >
            Account settings
          </Link>
          <Link
            to="/search"
            className="rounded-full border border-[#bfd3ff] bg-[#eef4ff] px-4 py-2 text-sm font-black text-[#12304a] shadow-sm transition hover:bg-[#e3edff]"
          >
            Find businesses
          </Link>
        </nav>
        {isOwner && analyticsLoading && (
          <section className="mt-6 rounded-[30px] bg-white p-8 text-center font-bold text-[#647b8b]">
            Loading business analytics...
          </section>
        )}
        {isOwner && analyticsError && !analytics && (
          <section className="mt-6 rounded-[30px] bg-[#fff3f3] p-5 text-sm font-semibold text-[#a63636]">
            {analyticsError}
          </section>
        )}
        {isOwner && analytics && (
          <section className="mt-6 rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_60px_rgba(18,48,74,0.08)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                  Business performance
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {analytics.business.business_name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                    analytics.business.verificationStatus === "verified"
                      ? "bg-[#eaf7f0] text-[#0f9d6f]"
                      : analytics.business.verificationStatus === "pending"
                        ? "bg-[#fff4dc] text-[#b86a00]"
                        : analytics.business.verificationStatus === "rejected"
                          ? "bg-[#ffe9e9] text-[#a63636]"
                          : "bg-[#eef4ff] text-[#2f68f1]"
                  }`}
                >
                  {analytics.business.verificationStatus === "verified"
                    ? "Verified"
                    : analytics.business.verificationStatus === "pending"
                      ? "Pending"
                      : analytics.business.verificationStatus === "rejected"
                        ? "Rejected"
                        : "Not verified"}
                </span>
                <Link
                  to="/verification"
                  className="rounded-full bg-[#12304a] px-4 py-2 text-xs font-black text-white"
                >
                  Verify business
                </Link>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-7 text-[#526b82]">
              {analytics.analysis.summary}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Insight label="Business account" value="Active" />
              <Insight label="Search visibility" value="Active" />
              <Insight
                label="Government registration"
                value={
                  analytics.business.verificationStatus === "verified"
                    ? "Verified"
                    : analytics.business.verificationStatus === "pending"
                      ? "Under review"
                      : analytics.business.verificationStatus === "rejected"
                        ? "Rejected"
                        : "Not verified"
                }
              />
            </div>
            <p className="mt-4 text-xs font-bold text-[#7d97ad]">
              Trust factors: Reviews{" "}
              {analytics.business.scoreBreakdown?.factors.reviews ?? 0} ·
              Authenticity{" "}
              {analytics.business.scoreBreakdown?.factors.reviewAuthenticity ??
                0}{" "}
              · Sentiment{" "}
              {analytics.business.scoreBreakdown?.factors.customerSentiment ??
                0}{" "}
              · Government{" "}
              {analytics.business.scoreBreakdown?.factors
                .governmentRegistration ?? 0}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Insight label="Sentiment" value={analytics.analysis.sentiment} />
              <Insight
                label="Positive"
                value={String(analytics.totals.positive)}
              />
              <Insight
                label="Verified"
                value={`${analytics.totals.verifiedPercentage}%`}
              />
              <Insight
                label="Review risk"
                value={`${analytics.analysis.riskScore}%`}
              />
            </div>
            <ul className="mt-5 space-y-2 text-sm font-semibold text-[#526b82]">
              {analytics.analysis.highlights.map((highlight) => (
                <li key={highlight}>
                  <i className="bi bi-check-circle-fill mr-2 text-[#2f68f1]" />
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-[22px] bg-[#f4f9fc] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">Business health</h3>
                <span className="rounded-full bg-[#eaf7f0] px-3 py-1 text-xs font-black text-[#0f9d6f]">
                  {analytics.analysis.health.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-[#526b82]">
                <p>
                  <strong className="text-[#12304a]">Problem:</strong>{" "}
                  {analytics.analysis.health.problem}
                </p>
                <p>
                  <strong className="text-[#12304a]">Possible reason:</strong>{" "}
                  {analytics.analysis.health.reason}
                </p>
                <p>
                  <strong className="text-[#12304a]">
                    Recommended action:
                  </strong>{" "}
                  {analytics.analysis.health.recommendation}
                </p>
                <p>
                  <strong className="text-[#12304a]">Expected benefit:</strong>{" "}
                  {analytics.analysis.health.expectedBenefit}
                </p>
              </div>
            </div>
          </section>
        )}
        <section className="mt-6 rounded-[30px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_60px_rgba(18,48,74,0.08)] sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">Recently submitted</h2>
            <span className="text-sm font-bold text-[#7d97ad]">
              {reviews.length} total
            </span>
          </div>
          {reviews.length === 0 ? (
            <div className="mt-8 rounded-[22px] border border-dashed border-[#cbdbea] p-8 text-center">
              <p className="font-black">No reviews yet</p>
              <Link
                to="/search"
                className="mt-4 inline-flex rounded-full bg-[#12304a] px-5 py-3 text-sm font-black text-white"
              >
                Start exploring
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[20px] bg-[#f8fbff] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/business/${review.slug}`}
                      className="font-black hover:text-[#2f68f1]"
                    >
                      {review.business_name}
                    </Link>
                    <span className="text-[#f4b740]">
                      {"★".repeat(review.rating)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#526b82]">
                    {review.review_text || "Audio or rating review"}
                  </p>
                  <p className="mt-2 text-xs font-bold text-[#8aa0b2]">
                    {review.verified_visit ? "Verified visit · " : ""}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#c6ddef]">
        {label}
      </p>
    </div>
  );
}
function Insight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f4f9fc] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#7d97ad]">
        {label}
      </p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
export default DashboardPage;
