import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type QrPayload = {
  business: { name: string; location: string };
  qrImageUrl: string;
  reviewUrl: string;
};

export function BusinessQrPage() {
  const { slug } = useParams<{ slug: string }>();
  const [payload, setPayload] = useState<QrPayload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/companies/${slug}/qr`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not load QR code");
        setPayload(data);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [slug]);

  return (
    <main className="min-h-screen bg-[#edf5fb] px-4 py-8 text-[#12304a] sm:py-14">
      <div className="mx-auto max-w-[560px] rounded-[32px] border border-[#dfeaf6] bg-white p-6 text-center shadow-[0_30px_80px_rgba(18,48,74,0.12)] sm:p-10">
        <Link
          to={`/business/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-black text-[#2f68f1]"
        >
          <i className="bi bi-arrow-left" /> Back to business
        </Link>
        {error ? (
          <div className="mt-12 rounded-[22px] border border-[#f7c7c7] bg-[#fff3f3] p-5 text-sm font-semibold text-[#a63636]">
            {error}
          </div>
        ) : !payload ? (
          <div className="py-20">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#dfeaf6] border-t-[#2f68f1]" />
            <p className="mt-4 font-black">Preparing your monthly QR code...</p>
          </div>
        ) : (
          <>
            <p className="mt-10 text-[11px] font-black uppercase tracking-[0.22em] text-[#2f68f1]">
              Customer invite
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">
              Scan to review {payload.business.name}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm font-semibold leading-6 text-[#647b8b]">
              Customers can scan this code at your location to open the review
              flow. Each business code rotates monthly.
            </p>
            <div className="mx-auto mt-8 w-fit rounded-[28px] border border-[#dfeaf6] bg-[#f8fbff] p-4 shadow-inner">
              <img
                src={payload.qrImageUrl}
                alt={`QR code for ${payload.business.name}`}
                className="size-64 sm:size-72"
              />
            </div>
            <p className="mt-5 text-xs font-bold text-[#8aa0b2]">
              {payload.business.location}
            </p>
            <a
              href={payload.reviewUrl}
              className="mt-8 inline-flex rounded-full bg-gradient-to-r from-[#12304a] via-[#1b4068] to-[#2f68f1] px-6 py-3 text-sm font-black text-white shadow-[0_18px_30px_rgba(47,104,241,0.22)]"
            >
              Open review flow
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default BusinessQrPage;
