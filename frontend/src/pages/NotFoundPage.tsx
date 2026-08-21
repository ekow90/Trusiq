import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#edf5fb] px-4 py-10 text-[#12304a]">
      <div className="mx-auto max-w-[760px] rounded-[32px] border border-[#dfeaf6] bg-white p-6 shadow-[0_30px_80px_rgba(18,48,74,0.08)] sm:p-8">
        <div className="mb-6 inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#2f68f1]">
          404 Error
        </div>

        <h1 className="text-5xl font-black tracking-[-0.08em] sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#5d7290] sm:text-lg">
          This route does not exist yet in the TRUSIQ frontend. Head back to
          safety and continue exploring trusted businesses.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#12304a] via-[#1b4068] to-[#2f68f1] px-5 py-3 text-sm font-black text-white shadow-[0_18px_30px_rgba(47,104,241,0.22)] transition hover:-translate-y-0.5"
          >
            <i className="bi bi-arrow-left" />
            Back home
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-full border border-[#dfeaf6] bg-[#f7fafc] px-5 py-3 text-sm font-black text-[#12304a] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <i className="bi bi-search" />
            Search businesses
          </Link>
        </div>
      </div>
    </div>
  );
}
