import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type BusinessSpotlight = {
  slug: string;
  name: string;
  category: string;
  location: string;
  score: string;
  reviews: string;
  status: string;
  icon: string;
  tone: string;
};

const placeholderBusinesses: BusinessSpotlight[] = [];

const signals = [
  {
    label: "Verified visits",
    value: "82%",
    width: "82%",
    color: "bg-[#9ed4ef]",
  },
  {
    label: "Review quality",
    value: "91%",
    width: "91%",
    color: "bg-[#7eb8df]",
  },
  { label: "Response rate", value: "76%", width: "76%", color: "bg-[#b2c9e5]" },
];

export function RedesignedHomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessSpotlight[]>(
    placeholderBusinesses,
  );

  useEffect(() => {
    async function loadBusinesses() {
      try {
        const response = await fetch("/api/companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        const mapped = (data.companies || []).map((company: any) => ({
          slug: company.slug,
          name: company.name,
          category: company.category || "General",
          location: company.location || "Location unavailable",
          score: String(Number(company.trustScore || 0)),
          reviews: String(Number(company.reviewsCount || 0)),
          status:
            company.trustScore >= 80 ? "High confidence" : "Growing trust",
          icon: "bi-building",
          tone: "bg-[#e2f1fa] text-[#35749a]",
        }));
        setBusinesses(mapped);
      } catch (error) {
        setBusinesses([]);
      }
    }

    void loadBusinesses();
  }, []);

  const search = query.toLowerCase();
  const visibleBusinesses = businesses.filter(
    (business) =>
      !search ||
      `${business.name} ${business.category} ${business.location}`
        .toLowerCase()
        .includes(search),
  );
  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleNavClick = (id: string) => {
    setIsMenuOpen(false);
    scrollTo(id);
  };

  const goToBusinessProfile = (slug: string) => {
    navigate(`/business/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell min-h-screen overflow-hidden">
        <header className="relative z-20 border-b border-[#d8e6ef] bg-[#f4f9fc]/95 backdrop-blur lg:sticky lg:top-0">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <button
              className="flex items-center gap-3"
              type="button"
              aria-label="Trusiq home"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#12304a] text-[#a9d8f5] shadow-[4px_4px_0_#a9d8f5]">
                <i className="bi bi-shield-check text-lg" aria-hidden="true" />
              </span>
              <span className="text-[17px] font-black tracking-[-0.04em]">
                trusiq
              </span>
            </button>

            <nav className="hidden items-center gap-8 text-[13px] font-bold text-[#657b8b] lg:flex">
              <button
                className="hover:text-[#12304a]"
                type="button"
                onClick={() => handleNavClick("discover")}
              >
                Discover
              </button>
              <button
                className="hover:text-[#12304a]"
                type="button"
                onClick={() => handleNavClick("signals")}
              >
                Trust signals
              </button>
              <button
                className="hover:text-[#12304a]"
                type="button"
                onClick={() => handleNavClick("business")}
              >
                For businesses
              </button>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                className="inline-flex items-center justify-center rounded-lg border border-[#dce4ee] bg-white/90 p-2.5 text-[#4f636f] transition hover:bg-[#f0f4f7] lg:hidden"
                type="button"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <i
                  className={`bi ${isMenuOpen ? "bi-x-lg" : "bi-list"}`}
                  aria-hidden="true"
                />
              </button>
              <button
                className="hidden rounded-lg px-4 py-2.5 text-[13px] font-extrabold text-[#657b8b] hover:text-[#12304a] sm:inline-flex"
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
              <button
                className="inline-flex rounded-lg bg-[#12304a] px-4 py-2.5 text-[13px] font-extrabold text-white hover:bg-[#1e4968]"
                type="button"
                onClick={() => navigate("/register")}
              >
                List a business
              </button>
            </div>
          </div>

          {isMenuOpen ? (
            <div className="border-t border-[#d8e6ef] bg-[#f4f9fc]/95 px-5 py-4 lg:hidden">
              <nav className="flex flex-col gap-3 text-sm font-bold text-[#375b72]">
                <button
                  className="text-left hover:text-[#12304a]"
                  type="button"
                  onClick={() => handleNavClick("discover")}
                >
                  Discover
                </button>
                <button
                  className="text-left hover:text-[#12304a]"
                  type="button"
                  onClick={() => handleNavClick("signals")}
                >
                  Trust signals
                </button>
                <button
                  className="text-left hover:text-[#12304a]"
                  type="button"
                  onClick={() => handleNavClick("business")}
                >
                  For businesses
                </button>
                <button
                  className="text-left rounded-lg border border-[#d8e6ef] bg-white px-4 py-2 text-[#12304a]"
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/login");
                  }}
                >
                  Sign in
                </button>
              </nav>
            </div>
          ) : null}
        </header>

        <main>
          <section className="relative overflow-hidden bg-[#12304a] px-5 pb-16 pt-14 text-white sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
            <div className="pointer-events-none absolute -right-28 top-16 size-80 rounded-full border-[50px] border-[#a9d8f5]/15 sm:size-[520px] sm:border-[74px]" />
            <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(450px,0.75fr)] lg:items-center lg:gap-20">
              <div>
                <div className="mb-7 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#a9d8f5]">
                  <span className="size-2 rounded-full bg-[#a9d8f5]" />
                  Trust intelligence for everyday decisions
                </div>
                <h1 className="max-w-3xl text-[42px] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[84px]">
                  Know who to trust
                  <span className="block text-[#a9d8f5]">
                    before you choose.
                  </span>
                </h1>
                <p className="mt-7 max-w-xl text-[17px] leading-7 text-[#b5c0b6] sm:text-lg">
                  Trusiq turns scattered reviews into clear, explainable trust
                  signals, so your next purchase feels like a decision, not a
                  gamble.
                </p>
                <form
                  className="mt-9 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                >
                  <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                    <i
                      className="bi bi-search text-lg text-[#7d887d]"
                      aria-hidden="true"
                    />
                    <input
                      className="min-w-0 flex-1 bg-transparent py-3 text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#8ba2b1]"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search a business or service"
                      type="search"
                    />
                  </label>
                  <button
                    className="rounded-xl bg-[#a9d8f5] px-6 py-3 text-[14px] font-black text-[#12304a] hover:bg-[#c7e6fa]"
                    type="submit"
                  >
                    Explore trust
                  </button>
                </form>
                <p className="mt-4 text-xs font-semibold text-[#879487]">
                  Try “Kora Kitchen”, “healthcare”, or “home repairs”
                </p>
              </div>

              <div className="relative mx-auto w-full max-w-[530px] lg:mr-0">
                <div className="absolute -inset-3 rounded-[30px] border border-[#a9d8f5]/25" />
                <div className="relative rounded-[24px] bg-[#f5faff] p-4 text-[#12304a] shadow-[18px_22px_0_rgba(126,184,223,0.2)] sm:p-5">
                  <div className="flex items-center justify-between border-b border-[#dfe5d8] pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#849083]">
                        Live trust profile
                      </p>
                      <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">
                        Kora Kitchen
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#e6f4c7] px-3 py-1.5 text-[11px] font-black text-[#527329]">
                      <i
                        className="bi bi-patch-check-fill mr-1"
                        aria-hidden="true"
                      />
                      Verified
                    </span>
                  </div>
                  <div className="grid gap-5 py-5 sm:grid-cols-[0.85fr_1.15fr] sm:items-center">
                    <div className="flex items-center gap-4 sm:block">
                      <div className="grid size-28 place-items-center rounded-full border-[10px] border-[#a9d8f5] bg-[#12304a] text-white sm:size-36">
                        <div className="text-center">
                          <p className="text-4xl font-black tracking-[-0.07em]">
                            94.8
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#aab5a8]">
                            Trust score
                          </p>
                        </div>
                      </div>
                      <div className="sm:mt-4">
                        <p className="text-sm font-black">High confidence</p>
                        <p className="mt-1 text-xs font-semibold text-[#7f8a80]">
                          Based on 186 reviews
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {signals.map((signal) => (
                        <div key={signal.label}>
                          <div className="mb-1.5 flex justify-between text-xs font-bold">
                            <span className="text-[#6e796e]">
                              {signal.label}
                            </span>
                            <span>{signal.value}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#dfe5d8]">
                            <div
                              className={`h-full rounded-full ${signal.color}`}
                              style={{ width: signal.width }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-bold text-[#69746a]">
                    <span>
                      <i
                        className="bi bi-activity mr-2 text-[#5f8c23]"
                        aria-hidden="true"
                      />
                      Updated 8 minutes ago
                    </span>
                    <button
                      className="text-[#12304a] underline decoration-[#a9d8f5] decoration-2 underline-offset-4"
                      type="button"
                      onClick={() => scrollTo("signals")}
                    >
                      See why
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#d8e6ef] bg-[#f4f9fc] px-5 py-7 sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#889287]">
                One clearer view of reputation
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-black text-[#4c5a4d]">
                <span>
                  <strong className="text-xl">12k+</strong> businesses
                </span>
                <span>
                  <strong className="text-xl">48k</strong> verified visits
                </span>
                <span>
                  <strong className="text-xl">4.8/5</strong> decision clarity
                </span>
              </div>
            </div>
          </section>

          <section
            id="discover"
            className="scroll-mt-20 bg-[#f4f9fc] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
          >
            <div className="mx-auto max-w-[1440px]">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#397aa3]">
                    Explore with context
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] sm:text-5xl">
                    Businesses people trust.
                  </h2>
                </div>
                <p className="max-w-sm text-sm font-semibold leading-6 text-[#788378]">
                  Compare real experiences, verified activity, and the signals
                  behind each score.
                </p>
              </div>
              <div className="mobile-scroll-row mt-8 pb-2 sm:flex-wrap sm:overflow-visible">
                {[
                  "Food & Drink",
                  "Health",
                  "Home services",
                  "Education",
                  "Tech",
                ].map((category, index) => (
                  <button
                    key={category}
                    className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black ${index === 0 ? "border-[#12304a] bg-[#12304a] text-white" : "border-[#c8dce9] text-[#657b8b] hover:border-[#12304a] hover:text-[#12304a]"}`}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {visibleBusinesses.length ? (
                  visibleBusinesses.map((business) => (
                    <article
                      key={business.name}
                      className="group rounded-2xl border border-[#dfe5da] bg-white p-5 hover:-translate-y-1 hover:border-[#b9d98a] hover:shadow-[0_18px_40px_rgba(31,47,32,0.09)]"
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`grid size-12 place-items-center rounded-xl text-xl ${business.tone}`}
                        >
                          <i
                            className={`bi ${business.icon}`}
                            aria-hidden="true"
                          />
                        </span>
                        <span className="rounded-full bg-[#e4f2fa] px-2.5 py-1 text-[10px] font-black text-[#2f6f94]">
                          <i
                            className="bi bi-check-circle-fill mr-1"
                            aria-hidden="true"
                          />
                          {business.status}
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-black tracking-[-0.04em]">
                        {business.name}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-[#879287]">
                        {business.category} <span className="mx-1">•</span>{" "}
                        {business.location}
                      </p>
                      <div className="mt-6 flex items-end justify-between border-t border-[#edf0eb] pt-4">
                        <div>
                          <p className="text-2xl font-black tracking-[-0.05em]">
                            {business.score}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8a968b]">
                            Trust score
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black">
                            {business.reviews}
                          </p>
                          <p className="text-[10px] font-bold text-[#8a968b]">
                            verified reviews
                          </p>
                        </div>
                      </div>
                      <button
                        className="mt-5 flex w-full items-center justify-between rounded-lg bg-[#f3f6ef] px-4 py-3 text-xs font-black text-[#415141] transition hover:bg-[#e8f3d3]"
                        type="button"
                        onClick={() => goToBusinessProfile(business.slug)}
                      >
                        View trust profile{" "}
                        <i
                          className="bi bi-arrow-up-right"
                          aria-hidden="true"
                        />
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#cbd5c7] px-6 py-12 text-center lg:col-span-3">
                    <p className="font-black">No matching businesses yet.</p>
                    <p className="mt-2 text-sm font-semibold text-[#788378]">
                      Try another name, category, or location.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            id="signals"
            className="scroll-mt-20 bg-[#eaf4fa] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
          >
            <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-24">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#397aa3]">
                  Not just a number
                </p>
                <h2 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.055em] sm:text-5xl">
                  A trust score you can actually understand.
                </h2>
                <p className="mt-6 max-w-lg text-[16px] font-semibold leading-7 text-[#687568]">
                  We bring the signals together, explain what they mean, and
                  show you where confidence comes from. Less noise. Better
                  decisions.
                </p>
                <button
                  className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#12304a] px-5 py-3.5 text-sm font-black text-white"
                  type="button"
                  onClick={() => scrollTo("discover")}
                >
                  Explore examples{" "}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="group rounded-2xl bg-[#12304a] p-6 text-white transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_24px_60px_rgba(18,48,74,0.16)] sm:row-span-2 sm:p-8">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#a9d8f5]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative">
                    <i
                      className="bi bi-cpu text-2xl text-[#a9d8f5]"
                      aria-hidden="true"
                    />
                    <p className="mt-12 text-2xl font-black tracking-[-0.04em]">
                      AI reads the pattern.
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#aeb9ad]">
                      Language, timing, and reviewer behavior are analyzed to
                      flag unusual activity without hiding genuine criticism.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-xs font-black text-[#a9d8f5]">
                      <span className="size-2 rounded-full bg-[#a9d8f5]" />
                      Analysis active
                    </div>
                  </div>
                </div>
                <div className="group rounded-2xl bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                  <i
                    className="bi bi-qr-code text-2xl text-[#397aa3]"
                    aria-hidden="true"
                  />
                  <p className="mt-10 text-lg font-black">Verified visits</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#7b887c]">
                    Real-world interactions add weight to a review.
                  </p>
                </div>
                <div className="group rounded-2xl bg-white p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                  <i
                    className="bi bi-link-45deg text-2xl text-[#397aa3]"
                    aria-hidden="true"
                  />
                  <p className="mt-10 text-lg font-black">
                    Transparent records
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#7b887c]">
                    Important reputation events stay traceable.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            id="business"
            className="scroll-mt-20 bg-[#f4f9fc] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
          >
            <div className="mx-auto grid max-w-[1440px] gap-8 rounded-[24px] bg-[#d7edf9] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2f6f94]">
                  For business owners
                </p>
                <h2 className="mt-4 max-w-2xl text-3xl font-black leading-[1.04] tracking-[-0.055em] sm:text-5xl">
                  Your reputation is already being built. Make it visible.
                </h2>
                <p className="mt-5 max-w-xl text-[16px] font-semibold leading-7 text-[#5e6e58]">
                  Claim your profile, invite verified customers, and understand
                  what turns a first visit into a lasting relationship.
                </p>
              </div>
              <button
                className="inline-flex h-fit items-center justify-center gap-3 rounded-lg bg-[#12304a] px-5 py-3.5 text-sm font-black text-white"
                type="button"
                onClick={() => navigate("/register")}
              >
                Build your trust profile{" "}
                <i className="bi bi-arrow-up-right" aria-hidden="true" />
              </button>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#d8e6ef] bg-[#f4f9fc] px-5 pb-8 pt-10 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-[#12304a] text-xs text-[#a9d8f5]">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                </span>
                <span className="font-black tracking-[-0.04em]">trusiq</span>
              </div>
              <p className="mt-3 max-w-xs text-xs font-semibold leading-5 text-[#849083]">
                A clearer standard for business reputation and consumer
                confidence.
              </p>
            </div>
            <div className="flex gap-5 text-[13px] font-bold text-[#788378]">
              <a className="hover:text-[#12304a]" href="#discover">
                Discover
              </a>
              <a className="hover:text-[#12304a]" href="#signals">
                Trust signals
              </a>
              <a className="hover:text-[#12304a]" href="#business">
                Businesses
              </a>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-[1440px] border-t border-[#d8e6ef] pt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#8fa5b4]">
            © 2026 Trusiq · Built for better decisions
          </p>
        </footer>
      </div>
    </div>
  );
}
