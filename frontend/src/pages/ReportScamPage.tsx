const reasonOptions = [
  {
    title: "Direct Scam",
    description: "Payment taken, no service/goods provided",
    icon: "bi-shield-check",
  },
  {
    title: "Identity Fraud",
    description: "Business impersonating another entity",
    icon: "bi-exclamation-triangle",
  },
  {
    title: "Counterfeit Products",
    description: "Products are not as advertised or fake",
    icon: "bi-bag-x",
  },
  {
    title: "Other Issues",
    description: "Suspicious activity or policy violation",
    icon: "bi-three-dots",
  },
];

export function ReportScamPage() {
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
            <button type="button" className="grid size-8 place-items-center rounded-full bg-white text-[#12304a] shadow-sm" aria-label="Back">
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <h1 className="text-[28px] font-black tracking-[-0.04em]">Report Scam</h1>
            <div className="size-8" />
          </div>
        </div>

        <div className="px-5 pb-5 pt-5">
          <div className="rounded-[16px] border border-[#f1c5c5] bg-[#fff1f1] p-4 text-[#b53d46]">
            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-[#f8dada] text-lg">
                <i className="bi bi-exclamation-triangle" aria-hidden="true" />
              </div>
              <p className="text-[16px] font-bold leading-6">
                Help us protect the community. Your report will be verified using AI trust analysis.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-[22px] font-black tracking-[-0.04em]">Business Information</h2>
            <label className="mt-3 block">
              <span className="mb-2 block text-[15px] font-black text-[#12304a]">Business Name</span>
              <div className="flex items-center gap-3 rounded-[14px] border border-[#dfe8f1] bg-white px-4 py-3 text-[#6b7f93] shadow-sm">
                <i className="bi bi-building" aria-hidden="true" />
                <input
                  className="w-full border-0 bg-transparent text-[15px] font-semibold text-[#12304a] outline-none placeholder:text-[#92a4b6]"
                  defaultValue="Global Tech Solutions"
                  placeholder="e.g., Global Tech Solutions"
                />
              </div>
            </label>
          </div>

          <div className="mt-7">
            <h2 className="text-[22px] font-black tracking-[-0.04em]">Reporting Reason</h2>
            <div className="mt-4 space-y-3">
              {reasonOptions.map((reason, index) => (
                <button
                  key={reason.title}
                  type="button"
                  className={index === 0 ? "flex w-full items-center gap-3 rounded-[16px] border border-[#2d6dba] bg-[#edf4ff] p-3 text-left" : "flex w-full items-center gap-3 rounded-[16px] border border-[#dfe8f1] bg-white p-3 text-left shadow-sm"}
                >
                  <div className={index === 0 ? "grid size-10 place-items-center rounded-full bg-[#2d6dba] text-white" : "grid size-10 place-items-center rounded-full bg-[#edf2f7] text-[#536a7d]"}>
                    <i className={`bi ${reason.icon}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[18px] font-black">{reason.title}</div>
                    <div className="text-[12px] text-[#5d7285]">{reason.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-[22px] font-black tracking-[-0.04em]">Details</h2>
            <label className="mt-3 block">
              <span className="mb-2 block text-[15px] font-black text-[#12304a]">What happened?</span>
              <textarea
                rows={5}
                className="w-full resize-none rounded-[16px] border border-[#dfe8f1] bg-white px-4 py-3 text-[15px] leading-6 text-[#12304a] outline-none placeholder:text-[#92a4b6]"
                placeholder="Provide specific details about your experience. Include dates, transaction IDs if possible..."
              />
              <div className="mt-2 text-right text-[12px] font-semibold text-[#7b8fa0]">Min. 20 characters</div>
            </label>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[22px] font-black tracking-[-0.04em]">Evidence</h2>
              <span className="inline-flex rounded-full border border-[#dfe8f1] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#5d7285]">Optional</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="grid place-items-center rounded-[14px] border border-dashed border-[#dfe8f1] bg-[#f7f9fb] px-4 py-5 text-center">
                <div className="mb-2 text-[24px] text-[#4c6479]">
                  <i className="bi bi-cloud-upload" aria-hidden="true" />
                </div>
                <div className="text-[16px] font-bold text-[#4c6479]">Upload</div>
              </div>
              <div className="relative grid place-items-center rounded-[14px] border border-[#dfe8f1] bg-[radial-gradient(circle_at_15%_15%,#3d3d3d,#141414)] p-4 text-white">
                <div className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-[#ff5a5a] text-[10px] font-black text-white">×</div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_38%,#4ca7ff,transparent_18%),radial-gradient(circle_at_55%_55%,#d73232,transparent_24%)] opacity-70" />
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[#5d7285]">Upload screenshots of chats, receipts, or misleading advertisements.</p>
          </div>

          <label className="mt-7 flex items-center gap-3 rounded-[16px] border border-[#dfe8f1] bg-white p-3 text-[14px] text-[#49637a] shadow-sm">
            <input type="checkbox" className="h-4 w-4 accent-[#2d6dba]" />
            <span className="flex-1">
              <span className="font-black">Allow Follow-up</span>
              <span className="block text-[#678097]">Our investigators may contact you if they need more information to verify this report.</span>
            </span>
          </label>

          <button type="button" className="mt-7 w-full rounded-[18px] bg-[#2d6dba] px-5 py-4 text-[28px] font-black text-white shadow-[0_18px_30px_rgba(45,109,186,0.28)]">
            Submit Report
          </button>

          <p className="mt-4 text-center text-[12px] leading-6 text-[#627b91]">
            By submitting, you confirm that the information provided is accurate to the best of your knowledge. False reporting may lead to account suspension.
          </p>
        </div>

        <div className="px-5 pb-4 text-center text-[20px] font-black tracking-[-0.04em] text-[#12304a]">
          Made with <span className="inline-block align-middle text-[#2d6dba]">♥</span>
        </div>
      </div>
    </div>
  );
}

export default ReportScamPage;
