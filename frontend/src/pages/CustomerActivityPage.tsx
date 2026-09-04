import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

type ActivityReview = {
  id: string;
  business_name: string;
  slug: string;
  rating: number;
  review_text: string;
  verified_visit: boolean;
  review_status: string;
  created_at: string;
};

export function CustomerActivityPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/activity", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Could not load activity");
        setReviews(body.reviews || []);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:px-8">
      <div className="mx-auto max-w-[900px]">
        <header className="flex items-center justify-between rounded-[28px] bg-white/85 px-5 py-4 shadow-[0_16px_35px_rgba(18,48,74,0.08)]">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-black text-[#2f68f1]"
          >
            <i className="bi bi-arrow-left" /> Back
          </Link>
          <h1 className="text-2xl font-black tracking-[-0.05em]">
            My activity
          </h1>
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="grid size-10 place-items-center rounded-full border border-[#dfeaf6] bg-white shadow-sm"
            aria-label="Notifications"
          >
            <i className="bi bi-bell" />
          </button>
        </header>
        <section className="mt-6 rounded-[28px] border border-[#dfeaf6] bg-white p-6 shadow-[0_24px_60px_rgba(18,48,74,0.08)] sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center rounded-full bg-[#12304a] text-2xl font-black text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                Customer account
              </p>
              <h2 className="mt-1 text-3xl font-black">
                {user?.name || "Customer"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#647b8b]">
                {reviews.length} reviews submitted
              </p>
            </div>
          </div>
          {loading ? (
            <p className="mt-10 text-center font-bold text-[#647b8b]">
              Loading your activity...
            </p>
          ) : error ? (
            <p className="mt-8 rounded-xl bg-[#fff3f3] p-4 text-sm font-semibold text-[#a63636]">
              {error}
            </p>
          ) : reviews.length === 0 ? (
            <div className="mt-10 rounded-[22px] border border-dashed border-[#cbdbea] p-8 text-center">
              <i className="bi bi-journal-text text-3xl text-[#2f68f1]" />
              <p className="mt-3 font-black">No activity yet</p>
              <p className="mt-2 text-sm text-[#647b8b]">
                Your submitted reviews will appear here.
              </p>
              <Link
                to="/search"
                className="mt-5 inline-flex rounded-full bg-[#12304a] px-5 py-3 text-sm font-black text-white"
              >
                Find a business
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[22px] border border-[#dfeaf6] bg-[#f8fbff] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/business/${review.slug}`}
                        className="text-lg font-black hover:text-[#2f68f1]"
                      >
                        {review.business_name}
                      </Link>
                      <p className="mt-2 text-[#f4b740]">
                        {"★".repeat(review.rating)}
                        <span className="text-[#d5dfe8]">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </p>
                    </div>
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
                      {review.verified_visit
                        ? "Verified visit"
                        : review.review_status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#456078]">
                    {review.review_text || "Audio or rating review"}
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#8aa0b2]">
                    {new Date(review.created_at).toLocaleString()}
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

export default CustomerActivityPage;
