const submissions = [
  {
    name: "Blue Horizon Tech Solutions",
    status: "Published",
    statusTone: "bg-[#2e73d5] text-white",
    rating: "★★★★★",
    time: "2 days ago",
    text: "Amazing service and complete transparency on the pricing model. Highly recommend for enterprise operations.",
  },
  {
    name: "The Organic Bean Cafe",
    status: "Pending",
    statusTone: "bg-[#edf1f5] text-[#5c6d7d]",
    rating: "★★★★☆",
    time: "1 week ago",
    text: "Great coffee, but the wait times can be a bit long during peak hours. The trust verification here is solid.",
  },
  {
    name: "FastTrack Logistics",
    status: "Flagged",
    statusTone: "bg-[#eb5d5d] text-white",
    rating: "★★★☆☆",
    time: "Feb 12, 2024",
    text: "Multiple delays without notification. Reported for inaccurate delivery windows.",
  },
];

export function CustomerActivityPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] p-4 sm:p-8">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#1d1d1d] bg-[#f5f7f9] text-[#12304a] shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#203246]">
            <span>9:41</span>
            <div className="flex items-center gap-2 text-[14px]">
              <i className="bi bi-signal" aria-hidden="true" />
              <i className="bi bi-wifi" aria-hidden="true" />
              <i className="bi bi-battery-full" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#1c2430] text-lg font-black text-white">
                <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-black tracking-[-0.05em]">
                My Activity
              </h1>
              <button
                className="grid size-10 place-items-center rounded-full bg-white text-[#12304a] shadow-sm"
                type="button"
                aria-label="Notifications"
              >
                <i className="bi bi-bell" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="rounded-[24px] bg-[#e9f0f8] p-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f4d3a6,#8d6c4d)] ring-4 ring-[#dfeaf7]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[22px] font-black tracking-[-0.04em]">
                    Alex Johnson
                  </h2>
                  <span className="text-[#2d6dba]">
                    <i className="bi bi-patch-check-fill" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-sm text-[#647786]">
                  Verified Trust Contributor
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#d4e0ef]">
                    <div className="h-full w-[85%] rounded-full bg-[#2f8ef7]" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#3f5e78]">
                    85%
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#4d6a87]">
                  Profile Power
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 border-t border-[#dce6f1] pt-4 text-center">
              <div>
                <div className="text-[22px] font-black">24</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#6b7e92]">
                  Reviews
                </div>
              </div>
              <div className="border-x border-[#dce6f1]">
                <div className="text-[22px] font-black">1.2k</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#6b7e92]">
                  Impact
                </div>
              </div>
              <div>
                <div className="text-[22px] font-black">12</div>
                <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#6b7e92]">
                  Saved
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 rounded-[16px] bg-[#edf2f7] p-1.5 text-center text-sm font-bold text-[#5a6d7f]">
            {["Reviews", "Saved", "Reports", "Account"].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={
                  index === 0
                    ? "rounded-xl bg-white px-2 py-2.5 text-[#12304a] shadow-sm"
                    : "rounded-xl px-2 py-2.5"
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-[24px] font-black tracking-[-0.04em]">
                Recently Submitted
              </h3>
              <span className="inline-flex rounded-full bg-[#edf2f6] px-2.5 py-1 text-[11px] font-black text-[#53687d]">
                24
              </span>
            </div>
            <button className="text-sm font-bold text-[#53687d]" type="button">
              Sort by Newest
            </button>
          </div>

          <div className="space-y-4">
            {submissions.map((item) => (
              <article
                key={item.name}
                className="rounded-[16px] border border-[#dfe8f1] bg-white p-4 shadow-[0_8px_18px_rgba(18,48,74,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-[18px] font-black tracking-[-0.04em] text-[#17314b]">
                        {item.name}
                      </h4>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${item.statusTone}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-[#6d7e90]">
                      <span className="text-[#f6b91c]">{item.rating}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[14px] leading-6 text-[#475d70]">
                  {item.text}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-[#ebf0f4] pt-3 text-sm font-bold text-[#44607d]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2"
                    >
                      <i className="bi bi-pencil-square" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2"
                    >
                      <i className="bi bi-trash" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                  <button type="button" className="font-black text-[#2d6dba]">
                    View Full
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="border-t border-[#dfe8f1] bg-white px-3 pb-3 pt-4">
          <div className="grid grid-cols-5 gap-2 text-center text-[12px] font-bold text-[#6d7e90]">
            <div className="flex flex-col items-center gap-1">
              <i className="bi bi-house-door" aria-hidden="true" />
              Home
            </div>
            <div className="flex flex-col items-center gap-1">
              <i className="bi bi-search" aria-hidden="true" />
              Explore
            </div>
            <div className="flex flex-col items-center gap-1">
              <i className="bi bi-star" aria-hidden="true" />
              Reviews
            </div>
            <div className="flex flex-col items-center gap-1 text-[#2d6dba]">
              <i className="bi bi-person-circle" aria-hidden="true" />
              Dashboard
            </div>
            <div className="relative flex flex-col items-center gap-1">
              <i className="bi bi-bell" aria-hidden="true" />
              Alerts
              <span className="absolute -right-1 top-0 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2d6dba] text-[8px] text-white">
                9
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 text-center text-[20px] font-black tracking-[-0.04em] text-[#12304a]">
          Made with{" "}
          <span className="inline-block align-middle text-[#2d6dba]">♥</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerActivityPage;
