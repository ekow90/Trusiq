import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const businessImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522204523234-8729aa6e65af?auto=format&fit=crop&w=1200&q=80",
];

type TrendingBusiness = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  location?: string;
  description?: string;
  trustScore?: number;
  image: string;
};

export default function TrendsPage() {
  const [items, setItems] = useState<TrendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/companies?sort=score&limit=30");
        const json = await resp.json();
        const businesses = Array.isArray(json.companies) ? json.companies : [];
        setItems(
          businesses.map((business: TrendingBusiness, index: number) => ({
            ...business,
            image:
              business.image || businessImages[index % businessImages.length],
          })),
        );
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#edf5fb] text-[#12304a]">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-[28px] bg-white/80 px-4 py-3 shadow-[0_18px_40px_rgba(18,48,74,0.08)] backdrop-blur-sm sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-[#dfeaf5] bg-[#f7fafc] text-lg font-black text-[#12304a] shadow-sm transition hover:-translate-x-0.5 hover:shadow-md"
            aria-label="Go back"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7d97ad]">
              Top rated
            </p>
            <h1 className="text-2xl font-black tracking-[-0.05em] sm:text-3xl">
              Trusted businesses
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/search")}
            className="rounded-full border border-[#dfeaf5] bg-[#eef4ff] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#2f68f1] shadow-sm transition hover:shadow-md"
          >
            Search
          </button>
        </header>

        <div className="grid gap-5">
          {loading ? (
            <div className="rounded-[28px] border border-[#dfeaf6] bg-white p-10 text-center shadow-[0_20px_50px_rgba(18,48,74,0.06)]">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-[4px] border-[#dfeaf6] border-t-[#2f68f1]" />
              <p className="mt-4 text-lg font-black text-[#12304a]">
                Loading top businesses…
              </p>
            </div>
          ) : items.length ? (
            items.map((business, index) => (
              <article
                key={business.id}
                className="group relative overflow-hidden rounded-[30px] border border-[#dfeaf6] bg-white shadow-[0_24px_70px_rgba(18,48,74,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(18,48,74,0.14)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(18,48,74,0.1), rgba(18,48,74,0.05)), url(${business.image})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/78" />

                <div className="relative grid gap-4 p-4 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:p-5">
                  <div className="h-32 overflow-hidden rounded-[24px] border border-white/40 shadow-lg shadow-[#dfeaf6] sm:h-36">
                    <img
                      src={business.image}
                      alt={business.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2f68f1]">
                        #{index + 1} ranked
                      </span>
                      <span className="rounded-full border border-[#dfeaf6] bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#4f6b88]">
                        {business.category}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#12304a] sm:text-[2rem]">
                      {business.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#4f6b88]">
                      <i className="bi bi-geo-alt-fill text-[#2f68f1]" />
                      {business.location}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#5b6c7b]">
                      {business.description ||
                        "Highly rated for consistent quality, strong customer service, and reliable trust signals."}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#eef4ff] to-[#f9fcff] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_28px_rgba(47,104,241,0.15)]">
                      <div>
                        <div className="text-[2rem] font-black leading-none text-[#2f68f1]">
                          {Math.round(business.trustScore || 0)}
                        </div>
                        <div className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#6a7b8f]">
                          Trust
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/business/${business.slug}`)}
                        className="rounded-full border border-[#dfeaf6] bg-white px-4 py-2 text-sm font-black text-[#12304a] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/review?business=${business.slug}`)
                        }
                        className="rounded-full bg-gradient-to-r from-[#12304a] to-[#2f68f1] px-4 py-2 text-sm font-black text-white shadow-[0_18px_34px_rgba(18,48,74,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(47,104,241,0.30)]"
                      >
                        Leave review
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-[#dfeaf6] bg-white p-10 text-center shadow-[0_20px_50px_rgba(18,48,74,0.06)]">
              <p className="text-xl font-black text-[#12304a]">
                No top businesses yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
