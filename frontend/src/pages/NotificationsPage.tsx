const notifications = [
  {
    type: "Business Verified Successfully",
    detail: "Your verification request for \"Eco-Tech Solutions\" has been approved by the trust review board.",
    time: "2 HOURS AGO",
    action: "View Certificate",
    accent: "bg-[#2d6dba] text-white",
    icon: "bi-shield-check",
    dot: "bg-[#2d6dba]",
  },
  {
    type: "New 5-Star Review!",
    detail: "Sarah Jenkins left a glowing review for your customer service. AI sentiment is strong.",
    time: "5 HOURS AGO",
    action: "Respond Now",
    accent: "bg-[#edf4ff] text-[#2d6dba]",
    icon: "bi-star-fill",
    dot: "bg-[#2d6dba]",
  },
  {
    type: "New Login Detected",
    detail: "A new login was recorded from an unrecognized device in New York, USA. If this was not you, secure your account.",
    time: "TODAY, 9:15 AM",
    action: "Security Settings",
    accent: "bg-[#edf4ff] text-[#2d6dba]",
    icon: "bi-shield-exclamation",
    dot: "bg-[#2d6dba]",
  },
  {
    type: "Review Updated",
    detail: "Your review for \"Gourmet Garden\" was found helpful by 12 other TRUSIQ users.",
    time: "YESTERDAY",
    action: "View Review",
    accent: "bg-[#edf4ff] text-[#2d6dba]",
    icon: "bi-person-circle",
    dot: "bg-[#12304a]",
  },
  {
    type: "Monthly Insight Report",
    detail: "Your August Trust Score summary is ready. You saw a 12% improvement in review authenticity.",
    time: "2 DAYS AGO",
    action: "See Analytics",
    accent: "bg-[#edf4ff] text-[#2d6dba]",
    icon: "bi-graph-up-arrow",
    dot: "bg-[#2d6dba]",
  },
];

const filters = ["All", "Unread", "System", "Personal"];

export function NotificationsPage() {
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
              <button type="button" className="grid size-10 place-items-center rounded-full bg-white text-lg text-[#12304a] shadow-sm" aria-label="Back">
                <i className="bi bi-arrow-left" aria-hidden="true" />
              </button>
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.05em]">Notifications</h1>
            <button type="button" className="grid size-10 place-items-center rounded-full bg-white text-lg text-[#12304a] shadow-sm" aria-label="More options">
              <i className="bi bi-three-dots" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 rounded-[18px] bg-[#edf2f7] p-2 text-center text-[12px] font-bold text-[#5d7185]">
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                className={index === 0 ? "rounded-[12px] bg-[#2d6dba] px-2 py-2 text-white" : "rounded-[12px] px-2 py-2"}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-black uppercase tracking-[0.12em] text-[#16304d]">Today</h2>
            <span className="inline-flex rounded-full bg-[#edf4ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#2d6dba]">2 New</span>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((item) => (
              <div key={item.type} className="rounded-[18px] bg-[#edf3f9] p-3.5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-[#2d6dba] text-lg text-white">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[18px] font-black tracking-[-0.04em]">{item.type}</h3>
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    </div>
                    <p className="mt-1 text-[14px] leading-6 text-[#4d6180]">{item.detail}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[12px] font-black uppercase tracking-[0.12em] text-[#677f96]">
                      <span>{item.time}</span>
                      <button type="button" className={`inline-flex rounded-[10px] px-3 py-2 ${item.accent}`}>
                        {item.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-black uppercase tracking-[0.12em] text-[#16304d]">Earlier</h2>
          </div>

          <div className="space-y-3">
            {notifications.slice(3).map((item) => (
              <div key={item.type} className="rounded-[18px] bg-[#edf3f9] p-3.5">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-[#2d6dba] text-lg text-white">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[18px] font-black tracking-[-0.04em]">{item.type}</h3>
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    </div>
                    <p className="mt-1 text-[14px] leading-6 text-[#4d6180]">{item.detail}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[12px] font-black uppercase tracking-[0.12em] text-[#677f96]">
                      <span>{item.time}</span>
                      <button type="button" className={`inline-flex rounded-[10px] px-3 py-2 ${item.accent}`}>
                        {item.action}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[18px] border border-dashed border-[#d5dfe8] bg-white p-4 text-center">
            <div className="mb-2 text-[30px] text-[#12304a]">
              <i className="bi bi-funnel" aria-hidden="true" />
            </div>
            <h3 className="text-[18px] font-black tracking-[-0.04em]">Responsive Design Tip</h3>
            <p className="mt-2 text-[14px] leading-6 text-[#5d7285]">
              On tablets and desktops, this list expands to a split-view. Notifications appear on the left, and a full detail panel opens on the right.
            </p>
          </div>
        </div>

        <div className="border-t border-[#dfe8f1] bg-white px-3 pb-3 pt-4">
          <div className="grid grid-cols-5 gap-2 text-center text-[12px] font-bold text-[#6d7e90]">
            <div className="flex flex-col items-center gap-1"><i className="bi bi-house-door" aria-hidden="true" />Home</div>
            <div className="flex flex-col items-center gap-1"><i className="bi bi-search" aria-hidden="true" />Explore</div>
            <div className="flex flex-col items-center gap-1"><i className="bi bi-star" aria-hidden="true" />Reviews</div>
            <div className="flex flex-col items-center gap-1"><i className="bi bi-person-circle" aria-hidden="true" />Dashboard</div>
            <div className="relative flex flex-col items-center gap-1 text-[#2d6dba]"><i className="bi bi-bell" aria-hidden="true" />Alerts<span className="absolute -right-1 top-0 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#2d6dba] text-[8px] text-white">9</span></div>
          </div>
        </div>

        <div className="px-5 pb-4 text-center text-[20px] font-black tracking-[-0.04em] text-[#12304a]">
          Made with <span className="inline-block align-middle text-[#2d6dba]">♥</span>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
