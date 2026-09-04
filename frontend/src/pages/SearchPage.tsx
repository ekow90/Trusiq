import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type BusinessRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  score: number;
  rating: number;
  reviewsCount: number;
  description?: string;
  website?: string;
};

type CompanyResponse = {
  id: string;
  slug: string;
  name: string;
  category?: string;
  location?: string;
  trustScore?: number;
  rating?: number;
  reviewsCount?: number;
  description?: string;
  website?: string;
};

const emptyBusinesses: BusinessRecord[] = [];

const defaultCategories = [
  "All Categories",
  "General",
  "IT Services",
  "Restaurants",
  "Retail",
  "Services",
];
const sortOptions = ["Relevance", "Score", "Distance"];

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [activeSort, setActiveSort] = useState("Relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [businesses, setBusinesses] =
    useState<BusinessRecord[]>(emptyBusinesses);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<BusinessRecord[]>([]);
  const debounceRef = useRef<number | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // load categories from backend
    (async function loadCategories() {
      try {
        const resp = await fetch("/api/companies/categories");
        if (!resp.ok) return;
        const json = await resp.json();
        if (Array.isArray(json.categories) && json.categories.length) {
          const sortedCategories = [...json.categories]
            .filter(Boolean)
            .sort((a: string, b: string) =>
              a.localeCompare(b, undefined, { sensitivity: "base" }),
            );
          setCategories(["All Categories", ...sortedCategories]);
        }
      } catch {
        // ignore and keep defaults
      }
    })();

    async function loadBusinesses() {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== "All Categories")
          params.set("category", activeCategory);
        params.set("verified", verifiedOnly ? "true" : "false");
        params.set("sort", activeSort.toLowerCase());

        const url =
          "/api/companies" + (params.toString() ? "?" + params.toString() : "");
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }
        const data = await response.json();
        const mapped = Array.isArray(data.companies)
          ? data.companies.map((company: CompanyResponse) => ({
              id: company.id,
              slug: company.slug,
              name: company.name,
              category: company.category || "General",
              location: company.location || "Unknown location",
              score: Number(company.trustScore || 0),
              rating: Number(company.rating || 0),
              reviewsCount: Number(company.reviewsCount || 0),
              description: company.description,
              website: company.website,
            }))
          : [];
        setBusinesses(mapped);
      } catch {
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    }

    void loadBusinesses();
  }, [activeCategory, verifiedOnly, activeSort]);

  // real-time suggestions (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    if (!query || !query.trim()) {
      window.setTimeout(() => setSuggestions([]), 0);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("q", query.trim());
        params.set("limit", "6");

        const url = "/api/companies?" + params.toString();
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        const mapped = Array.isArray(data.companies)
          ? data.companies.map((company: CompanyResponse) => ({
              id: company.id,
              slug: company.slug,
              name: company.name,
              category: company.category || "General",
              location: company.location || "Unknown location",
              score: Number(company.trustScore || 0),
              rating: Number(company.rating || 0),
              reviewsCount: Number(company.reviewsCount || 0),
              description: company.description,
              website: company.website,
            }))
          : [];

        setSuggestions(mapped.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

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
    [businesses, activeCategory, activeSort, query, verifiedOnly],
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

  function scrollCategories(dir: "left" | "right") {
    const el = categoriesRef.current;
    if (!el) return;
    const amount = Math.max(200, el.clientWidth * 0.6);
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f9fc] via-[#f8fbff] to-[#f4f9fc]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#d8e6ef]/40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center size-10 rounded-full text-[#12304a] hover:bg-[#eef4ff] transition"
          >
            <i className="bi bi-chevron-left text-lg" />
          </Link>
          <h1 className="text-lg font-black text-[#12304a]">Search</h1>
          <div className="size-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="mb-12 rounded-3xl bg-gradient-to-br from-[#12304a] via-[#1a3a5a] to-[#1f4b70] p-8 sm:p-12 lg:p-16 text-white shadow-2xl hover:shadow-[0_60px_120px_rgba(18,48,74,0.3)] transition-shadow">
          <div className="flex items-start gap-6">
            <div className="hidden sm:flex items-center justify-center size-16 lg:size-20 rounded-2xl bg-white/10 backdrop-blur">
              <i className="bi bi-search text-2xl lg:text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Discover trusted businesses
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
                Find verified providers, compare trust signals, and make
                confident decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-10 space-y-5">
          {/* Search Input */}
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-[#d8e6ef]/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-1 items-center gap-3 rounded-xl bg-white border border-[#eef4ff] px-4 py-3 shadow-sm">
                  <i className="bi bi-search text-[#657b8b]" />
                  <input
                    className="flex-1 bg-transparent text-sm font-semibold text-[#12304a] outline-none placeholder:text-[#a5b8c8]"
                    placeholder="Search businesses, categories, or locations"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#12304a] to-[#1f4b70] text-white font-black text-sm hover:shadow-lg transition-shadow"
                >
                  Search
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="mt-2 rounded-xl bg-white border border-[#eef4ff] shadow-lg overflow-hidden">
                  {suggestions.map((sug) => (
                    <li
                      key={sug.id}
                      className="px-4 py-3 cursor-pointer hover:bg-[#f9fcff] border-b border-[#eef4ff] last:border-b-0"
                      onClick={() => {
                        setQuery(sug.name);
                        setSuggestions([]);
                        navigate(`/business/${sug.slug}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-[#12304a]">
                            {sug.name}
                          </div>
                          <div className="text-xs text-[#657b8b]">
                            {sug.category} • {sug.location}
                          </div>
                        </div>
                        <div className="text-xs font-black text-[#2f68f1]">
                          {sug.score}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Categories */}
              <div className="relative -mx-6 px-6">
                <div className="relative">
                  <div
                    ref={categoriesRef}
                    className="overflow-x-auto pb-2 pl-4 pr-12 scroll-smooth"
                    style={
                      { WebkitOverflowScrolling: "touch" } as CSSProperties
                    }
                  >
                    <div className="flex gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black transition whitespace-nowrap ${
                            activeCategory === category
                              ? "bg-[#12304a] text-white shadow-md"
                              : "bg-white border border-[#eef4ff] text-[#657b8b] hover:bg-[#f9fcff]"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollCategories("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-white via-white to-transparent pl-2 pr-4 py-2"
                  >
                    <i className="bi bi-chevron-left text-[#12304a]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCategories("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-white via-white to-transparent pr-2 pl-4 py-2"
                  >
                    <i className="bi bi-chevron-right text-[#12304a]" />
                  </button>
                </div>
              </div>

              {/* Sort & Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => setActiveSort(option)}
                      className={`px-4 py-2 rounded-full text-xs font-black transition ${
                        activeSort === option
                          ? "bg-[#12304a] text-white shadow-md"
                          : "bg-white border border-[#eef4ff] text-[#657b8b] hover:bg-[#f9fcff]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#eef4ff] text-sm font-black text-[#12304a] cursor-pointer hover:bg-[#f9fcff] transition">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="accent-[#12304a]"
                  />
                  Verified
                </label>
              </div>
            </form>
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-white/50 backdrop-blur border border-[#d8e6ef]/30 p-5 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#7d97ad]">
                Results
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-[#12304a] mt-1">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "business" : "businesses"}
              </h3>
            </div>
            <button
              onClick={() => navigate("/map")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#d8e6ef] text-[#12304a] font-black text-sm hover:shadow-lg hover:border-[#12304a] transition"
            >
              <i className="bi bi-map" />
              Map view
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-5 mb-16">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#657b8b] font-black">Loading businesses…</p>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((business) => (
              <div
                key={business.id || business.slug}
                className="group rounded-2xl bg-white/70 backdrop-blur border border-[#e8eef5]/60 p-5 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-4 sm:gap-5 items-start"
              >
                {/* Score Card */}
                <button
                  onClick={() => navigate(`/business/${business.slug}`)}
                  className="flex flex-col items-center justify-center h-full rounded-xl bg-gradient-to-br from-[#eef4ff] to-[#f9fcff] border border-[#2f68f1]/20 py-4 hover:shadow-lg transition-shadow"
                >
                  <p className="text-3xl font-black text-[#2f68f1]">
                    {Math.round(business.score)}
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-wide text-[#657b8b] mt-1">
                    Score
                  </p>
                </button>

                {/* Content */}
                <div className="grid gap-3 min-w-0">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-[#7d97ad]">
                      {business.category}
                    </p>
                    <Link
                      to={`/business/${business.slug}`}
                      className="text-lg sm:text-xl font-black text-[#12304a] group-hover:text-[#2f68f1] transition mt-1 line-clamp-2 break-words"
                    >
                      {business.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-[#657b8b] mt-1 line-clamp-1">
                      {business.location}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5b6c7b] line-clamp-2 leading-relaxed">
                    {business.description || "Trusted business profile."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        business.score >= 80
                          ? "bg-[#eef4ff] text-[#2f68f1]"
                          : "bg-[#fff3cd] text-[#666]"
                      }`}
                    >
                      {business.score >= 80 ? "Verified" : "Growing"}
                    </span>
                    <button
                      onClick={() => navigate(`/business/${business.slug}`)}
                      className="px-4 py-1 rounded-full bg-[#12304a] text-white text-xs font-black hover:shadow-lg transition-shadow"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-2xl bg-white/50 backdrop-blur border border-[#d8e6ef]/30">
              <p className="text-[#657b8b] font-black">
                No businesses found. Try a different search.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-[#d8e6ef]/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <p className="text-xs font-black uppercase tracking-wide text-[#7d97ad]">
              Trust metrics
            </p>
            <h3 className="text-2xl font-black text-[#12304a] mt-3">
              Quality assured
            </h3>
            <p className="text-sm text-[#5b6c7b] mt-3">
              Results show verified businesses with strong trust scores.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Metric label="Verified" value="24" />
              <Metric label="Top score" value="94" />
              <Metric label="Rating" value="4.8" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#eef4ff]/40 to-[#f9fcff]/40 backdrop-blur border border-[#2f68f1]/20 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <p className="text-xs font-black uppercase tracking-wide text-[#2f68f1]">
              Featured
            </p>
            <h3 className="text-2xl font-black text-[#12304a] mt-3">
              Top businesses
            </h3>
            <p className="text-sm text-[#5b6c7b] mt-3">
              Browse top-rated services and share your experience.
            </p>
            <button
              onClick={() => navigate("/trends")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#12304a] to-[#1f4b70] text-white font-black text-sm hover:shadow-lg transition-shadow"
            >
              Explore
              <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-[#eef4ff] p-3 text-center">
      <p className="text-xs font-black uppercase tracking-wide text-[#7d97ad]">
        {label}
      </p>
      <p className="text-2xl font-black text-[#2f68f1] mt-2">{value}</p>
    </div>
  );
}
