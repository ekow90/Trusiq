import { Link, useParams } from "react-router-dom";

const companies = [
  {
    slug: "kora-kitchen",
    name: "Kora Kitchen",
    category: "Restaurant",
    location: "East Legon, Accra",
    trustScore: "9.4",
    trustLabel: "Outstanding Trust",
    verifiedBadge: "Live Verified",
    reviewsCount: "186",
    rating: "4.9",
    status: "High confidence",
    logoText: "KK",
    description:
      "Kora Kitchen is a neighborhood favorite with dependable service and strong customer sentiment. Reviews highlight fast delivery and consistent quality, with a few notes on busy weekend wait times.",
    strengths: [
      "Fast local delivery",
      "Consistent quality",
      "Popular with repeat customers",
    ],
    complaints: ["Weekend wait times", "Limited seating availability"],
    details: [
      { label: "Business hours", value: "Mon-Sun, 8am-10pm" },
      { label: "Website", value: "www.korakitchen.com" },
      { label: "Phone", value: "+233 24 555 0123" },
      { label: "Verified reviews", value: "186" },
    ],
  },
  {
    slug: "northstar-repairs",
    name: "Northstar Repairs",
    category: "Home services",
    location: "Osu, Accra",
    trustScore: "9.2",
    trustLabel: "Trusted Service",
    verifiedBadge: "Verified visits",
    reviewsCount: "74",
    rating: "4.7",
    status: "Verified visits",
    logoText: "NR",
    description:
      "Northstar Repairs is known for quick turnarounds and dependable local service. Verified visits show strong overall satisfaction, with a few customers requesting clearer upfront pricing.",
    strengths: [
      "Fast response times",
      "Skilled technicians",
      "Reliable repair tracking",
    ],
    complaints: ["Pricing clarity", "Appointment window length"],
    details: [
      { label: "Business hours", value: "Mon-Fri, 8am-5pm" },
      { label: "Website", value: "www.northstarrepairs.com" },
      { label: "Phone", value: "+233 24 555 0099" },
      { label: "Verified reviews", value: "74" },
    ],
  },
  {
    slug: "mosaic-learning",
    name: "Mosaic Learning",
    category: "Education",
    location: "Kumasi",
    trustScore: "8.9",
    trustLabel: "Strong Confidence",
    verifiedBadge: "Trusted reviews",
    reviewsCount: "128",
    rating: "4.6",
    status: "Growing trust",
    logoText: "ML",
    description:
      "Mosaic Learning delivers thoughtful educational programs with positive user feedback. Review data points to strong mentorship and course quality, plus a few suggestions for faster onboarding.",
    strengths: [
      "Engaging curriculum",
      "Responsive instructors",
      "Positive student outcomes",
    ],
    complaints: ["Enrollment process", "Availability of evening classes"],
    details: [
      { label: "Business hours", value: "Mon-Sat, 9am-7pm" },
      { label: "Website", value: "www.mosaiclearning.africa" },
      { label: "Phone", value: "+233 24 555 0321" },
      { label: "Verified reviews", value: "128" },
    ],
  },
  {
    slug: "summit-tech-solutions",
    name: "Summit Tech Solutions",
    category: "IT Services",
    location: "Downtown, Seattle",
    trustScore: "9.4",
    trustLabel: "Exceptional trust",
    verifiedBadge: "Blockchain Verified",
    reviewsCount: "1,240",
    rating: "4.8",
    status: "Reliable delivery",
    logoText: "ST",
    description:
      "Summit Tech Solutions consistently delivers high-quality IT services. Analysts highlight strong delivery reliability, though some clients note longer onboarding for larger enterprise projects.",
    strengths: [
      "Expert technical consulting",
      "Reliable support response",
      "Transparent project updates",
    ],
    complaints: ["Long onboarding for enterprise", "Higher custom setup time"],
    details: [
      { label: "Business hours", value: "Mon-Fri, 8am-6pm" },
      { label: "Website", value: "www.summittech.solutions" },
      { label: "Phone", value: "+1 (206) 555-0184" },
      { label: "Verified reviews", value: "1,240" },
    ],
  },
  {
    slug: "oceanic-fine-dining",
    name: "Oceanic Fine Dining",
    category: "Restaurants",
    location: "Waterfront Area",
    trustScore: "8.2",
    trustLabel: "High satisfaction",
    verifiedBadge: "Verified Reviews",
    reviewsCount: "412",
    rating: "4.5",
    status: "Top-rated service",
    logoText: "OF",
    description:
      "Oceanic Fine Dining is praised for exceptional atmosphere and attentive staff. Review signals show strong food quality, with occasional notes on wait times during peak hours.",
    strengths: [
      "High-quality dining experience",
      "Attentive service",
      "Great waterfront views",
    ],
    complaints: ["Busy evening waits", "Premium pricing"],
    details: [
      { label: "Business hours", value: "Tue-Sun, 11am-11pm" },
      { label: "Website", value: "www.oceanicdining.com" },
      { label: "Phone", value: "+1 (206) 555-0224" },
      { label: "Verified reviews", value: "412" },
    ],
  },
  {
    slug: "green-horizon-landsc",
    name: "Green Horizon Landsc",
    category: "Home Services",
    location: "Bellevue District",
    trustScore: "6.8",
    trustLabel: "Trusted provider",
    verifiedBadge: "Review Quality",
    reviewsCount: "98",
    rating: "4.2",
    status: "Reliable care",
    logoText: "GH",
    description:
      "Green Horizon Landsc is trusted for residential landscaping and maintenance. Customers note friendly crews and solid results, with some requests for clearer timeline expectations.",
    strengths: [
      "Detailed yard care",
      "Friendly service",
      "Reliable maintenance plans",
    ],
    complaints: ["Timeline expectations", "Seasonal scheduling"],
    details: [
      { label: "Business hours", value: "Mon-Fri, 7am-5pm" },
      { label: "Website", value: "www.greenhorizonlandsc.com" },
      { label: "Phone", value: "+1 (425) 555-0190" },
      { label: "Verified reviews", value: "98" },
    ],
  },
  {
    slug: "velocity-auto-rep",
    name: "Velocity Auto Rep",
    category: "Services",
    location: "Industrial Way",
    trustScore: "8.9",
    trustLabel: "Strong reliability",
    verifiedBadge: "Top Trust Score",
    reviewsCount: "212",
    rating: "4.6",
    status: "Rapid turnaround",
    logoText: "VA",
    description:
      "Velocity Auto Rep earns praise for fast turnaround and trustworthy auto repairs. Review signals show good service, with a few customers mentioning follow-up communication improvements.",
    strengths: [
      "Fast repair estimates",
      "Quality workmanship",
      "Clear communication",
    ],
    complaints: ["Follow-up communication", "Busy scheduling windows"],
    details: [
      { label: "Business hours", value: "Mon-Sat, 8am-6pm" },
      { label: "Website", value: "www.velocityautorep.com" },
      { label: "Phone", value: "+1 (206) 555-0148" },
      { label: "Verified reviews", value: "212" },
    ],
  },
];

const reviews = [
  {
    reviewer: "Marcus Aurelius",
    role: "Verified Reviewer",
    time: "2 days ago",
    quote:
      "The integration process was seamless. Their tools for reputation management saved our team dozens of hours per week.",
    rating: 5,
  },
  {
    reviewer: "Seraphina Vance",
    role: "Verified Visit",
    time: "1 week ago",
    quote:
      "Solid platform but the initial setup took longer than expected. Once running, the insights are incredibly valuable for growth.",
    rating: 4,
  },
  {
    reviewer: "David Chen",
    role: "Verified Reviewer",
    time: "Oct 24, 2023",
    quote:
      "Reliable partner for scaling enterprise solutions. Highly recommend the consulting arm.",
    rating: 5,
  },
];

export function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const business = companies.find((company) => company.slug === slug);

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
                        {business.logoText}
                      </div>
                      <div className="text-white">
                        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white shadow-sm">
                          {business.verifiedBadge}
                        </span>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                          {business.name}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-base">
                          {business.category} � {business.location}
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
                        {business.trustLabel}
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7d97ad]">
                        Rating
                      </p>
                      <p className="mt-3 text-3xl font-black text-[#12304a]">
                        {business.rating}
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
                        {business.status}
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-semibold leading-7 text-[#5b6c7b]">
                      {business.description}
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-[1fr_1fr]">
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                        Reputation insights
                      </p>
                      <h4 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                        Top strengths
                      </h4>
                      <ul className="mt-5 space-y-3">
                        {business.strengths.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-3 rounded-2xl bg-[#f4f9fc] px-4 py-3 text-sm font-semibold text-[#12304a]"
                          >
                            <i
                              className="bi bi-check-circle-fill text-[#2f68f1]"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(18,48,74,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7d97ad]">
                        Reputation alerts
                      </p>
                      <h4 className="mt-3 text-xl font-black tracking-[-0.04em] text-[#12304a]">
                        Common complaints
                      </h4>
                      <ul className="mt-5 space-y-3">
                        {business.complaints.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-3 rounded-2xl border border-[#fdecea] bg-[#fff3f5] px-4 py-3 text-sm font-semibold text-[#ad1f31]"
                          >
                            <i
                              className="bi bi-exclamation-circle-fill"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
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
                  {reviews.map((review) => (
                    <div
                      key={review.reviewer}
                      className="rounded-[28px] border border-[#e3ebf3] bg-[#fafcff] p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dbe9ff] text-lg font-black text-[#1f4f7a]">
                            {review.reviewer
                              .split(" ")
                              .map((word) => word[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#12304a]">
                              {review.reviewer}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#657b8b]">
                              {review.role} � {review.time}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#2f68f1]">
                          {review.rating}.0
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#5b6c7b]">
                        {review.quote}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                        <button
                          type="button"
                          className="transition hover:text-[#12304a]"
                        >
                          Helpful
                        </button>
                        <span>�</span>
                        <button
                          type="button"
                          className="transition hover:text-[#12304a]"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-[28px] bg-[#f4f9fc] px-5 py-4 text-sm font-semibold text-[#12304a] shadow-sm">
                  <p>{business.reviewsCount} reviews � 4.8 average</p>
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
                  {business.details.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[24px] bg-[#f4f9fc] p-4"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#657b8b]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#12304a]">
                        {item.value}
                      </p>
                    </div>
                  ))}
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
