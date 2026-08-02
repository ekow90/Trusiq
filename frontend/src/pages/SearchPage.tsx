import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const businesses = [
  {
    slug: "summit-tech-solutions",
    name: "Summit Tech Solutions",
    category: "IT Services",
    location: "Downtown, Seattle",
    score: 94,
    badge: "Blockchain Verified",
    details: "Consistent high marks for delivery",
  },
  {
    slug: "oceanic-fine-dining",
    name: "Oceanic Fine Dining",
    category: "Restaurants",
    location: "Waterfront Area",
    score: 82,
    badge: "Verified Reviews",
    details: "Highly rated for service and atmosphere",
  },
  {
    slug: "green-horizon-landsc",
    name: "Green Horizon Landsc",
    category: "Home Services",
    location: "Bellevue District",
    score: 68,
    badge: "Review Quality",
    details: "Trusted by local homeowners for reliability",
  },
  {
    slug: "velocity-auto-rep",
    name: "Velocity Auto Rep",
    category: "Services",
    location: "Industrial Way",
    score: 89,
    badge: "Top Trust Score",
    details: "Fast turnaround with verified customer satisfaction",
  },
];

const categories = ["All Categories", "Restaurants", "Services", "IT Services"];
const sortOptions = ["Relevance", "Score", "Distance"];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [activeSort, setActiveSort] = useState("Relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const filteredResults = useMemo(
    () =>
      businesses
        .filter((business) => {
          if (verifiedOnly && business.score < 80) {
            return false;
          }

          if (
            activeCategory !== "All Categories" &&
            business.category !== activeCategory
          ) {
            return false;
          }

          if (!query.trim()) {
            return true;
          }

          return `${business.name} ${business.category} ${business.location}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        })
        .sort((a, b) => {
          if (activeSort === "Score") {
            return b.score - a.score;
          }
          return 0;
        }),
    [activeCategory, activeSort, query, verifiedOnly],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    if (activeCategory !== "All Categories") {
      params.set("category", activeCategory);
    }
    params.set("verified", verifiedOnly ? "true" : "false");
    params.set("sort", activeSort.toLowerCase());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell min-h-screen overflow-hidden">
        <header className="border-b border-[#d8e6ef] bg-white/95 backdrop-blur lg:bg-[#f4f9fc]/95">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <Link
              to="/"
              className="grid size-10 place-items-center rounded-xl text-xl text-[#12304a] transition hover:bg-white"
              aria-label="Back home"
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </Link>
            <p className="text-xl font-black tracking-[-0.04em]">
              Search businesses
            </p>
            <span className="size-10" />
          </div>
        </header>

        <main className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-12">
          <section className="grid gap-8">
            <div className="rounded-[28px] bg-[#12304a] p-10 text-white shadow-[0_24px_70px_rgba(18,48,74,0.18)]">
              <div className="grid size-16 place-items-center rounded-2xl bg-white text-3xl text-[#12304a]">
                <i className="bi bi-search" aria-hidden="true" />
              </div>
              <h1 className="mt-10 text-5xl font-black tracking-[-0.06em] sm:text-6xl">
                Discover trusted businesses
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/80">
                Search verified providers across categories, compare trust
                signals, and find the right partner quickly.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#d8e6ef] bg-white p-6 shadow-[0_18px_50px_rgba(18,48,74,0.08)]">
              <form className="grid gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 rounded-[24px] border border-[#e5eef7] bg-[#f7fbff] p-4">
                  <label className="text-xs font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                    Search verified businesses
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-[0_10px_20px_rgba(18,48,74,0.08)]">
                      <i
                        className="bi bi-search text-lg text-[#657b8b]"
                        aria-hidden="true"
                      />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-sm font-black text-[#12304a] outline-none placeholder:text-[#8b9eae]"
                        placeholder="Search businesses, categories, or locations"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>
                    <button
                      className="inline-flex h-14 items-center justify-center rounded-[20px] bg-[#12304a] px-6 text-sm font-black text-white transition hover:bg-[#1f4b70]"
                      type="submit"
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[24px] border border-[#e5eef7] bg-white p-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full px-4 py-2 text-xs font-black transition ${
                          activeCategory === category
                            ? "bg-[#12304a] text-white"
                            : "bg-[#f4f9fc] text-[#657b8b] hover:bg-[#eef4ff]"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => setActiveSort(option)}
                          className={`rounded-full px-4 py-2 text-xs font-black transition ${
                            activeSort === option
                              ? "bg-[#12304a] text-white"
                              : "bg-[#f4f9fc] text-[#657b8b] hover:bg-[#eef4ff]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-3 rounded-full border border-[#d8e6ef] bg-[#f4f9fc] px-4 py-2 text-sm font-black text-[#12304a]">
                      <input
                        className="h-4 w-4 rounded border-[#cbd3dd] accent-[#12304a]"
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(event) =>
                          setVerifiedOnly(event.target.checked)
                        }
                      />
                      Verified only
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className="rounded-[28px] border border-[#d8e6ef] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                    Search results
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#12304a]">
                    {filteredResults.length} businesses matched
                  </h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d8e6ef] bg-white px-5 py-3 text-sm font-black text-[#12304a] transition hover:border-[#12304a] hover:text-[#12304a]"
                >
                  <i className="bi bi-map" aria-hidden="true" />
                  Map view
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((business) => (
                  <article
                    key={business.name}
                    className="grid gap-5 rounded-[32px] border border-[#e8eef5] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.05)] sm:grid-cols-[120px_1fr] sm:items-center"
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/business/${business.slug}`)}
                      className="flex min-h-[120px] flex-col items-center justify-center rounded-[28px] border border-[#eef4ff] bg-[#f4f9fc] p-4 text-center transition hover:border-[#12304a] sm:w-full"
                    >
                      <p className="text-4xl font-black tracking-[-0.04em] text-[#12304a]">
                        {business.score}
                      </p>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#657b8b]">
                        Trust score
                      </p>
                    </button>
                    <div className="grid gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7d97ad]">
                          {business.category}
                        </p>
                        <Link
                          to={`/business/${business.slug}`}
                          className="mt-3 block text-2xl font-black tracking-[-0.04em] text-[#12304a] transition hover:text-[#1d3f5e]"
                        >
                          {business.name}
                        </Link>
                        <p className="mt-2 text-sm font-semibold text-[#657b8b]">
                          {business.location}
                        </p>
                      </div>
                      <p className="text-sm font-semibold leading-6 text-[#5b6c7b]">
                        {business.details}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-[#eef4ff] px-3 py-2 text-xs font-black text-[#2f68f1]">
                          {business.badge}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/business/${business.slug}`)}
                          className="rounded-full bg-[#12304a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#1f4b70]"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[32px] border border-dashed border-[#cbd3dc] bg-white p-10 text-center text-sm font-black text-[#657b8b]">
                  No businesses matched your search. Try another keyword or
                  category.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="rounded-[28px] border border-[#d8e6ef] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                Trust dashboard
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#12304a]">
                Filter confidence
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#5b6c7b]">
                Search results are limited to businesses with verified trust
                metrics and strong ratings.
              </p>

              <div className="mt-6 grid gap-4">
                <Metric label="Verified businesses" value="24" />
                <Metric label="Top trust score" value="94" />
                <Metric label="Avg. review rating" value="4.8/5" />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#d8e6ef] bg-[#eef4ff] p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2f68f1]">
                Trending insights
              </p>
              <h3 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                Seattle demand is rising
              </h3>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#12304a]/80">
                Local trust scores for service businesses grew by 15% this
                month.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#12304a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1f4b70]"
              >
                Explore trends
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#e5eef7] bg-white px-4 py-4">
      <p className="text-sm font-black text-[#7d97ad] uppercase tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#12304a]">{value}</p>
    </div>
  );
}
