import { useEffect, useState } from "react";

type MapBusiness = {
  id: string;
  name: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
};

export default function MapPage() {
  const [items, setItems] = useState<MapBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/companies?limit=200");
        const json = await resp.json();
        setItems(
          Array.isArray(json.companies)
            ? json.companies.filter(
                (company: MapBusiness) => company.latitude && company.longitude,
              )
            : [],
        );
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="mx-auto max-w-[1200px] p-8">
        <h1 className="text-3xl font-black">Map view</h1>
        <p className="mt-2 text-sm text-[#5b6c7b]">
          Businesses with coordinates are shown below. Click a marker to open
          profile (interactive map to be added).
        </p>

        <div className="mt-6 grid gap-4">
          {loading ? (
            <div>Loading…</div>
          ) : items.length ? (
            <div className="rounded-[18px] bg-white p-4 shadow-[0_20px_50px_rgba(18,48,74,0.08)]">
              <ul className="grid gap-2">
                {items.map((c) => (
                  <li key={c.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-black">{c.name}</div>
                      <div className="text-xs text-[#657b8b]">
                        {c.category} • {c.location}
                      </div>
                    </div>
                    <div className="text-xs text-[#657b8b]">
                      {c.latitude?.toFixed(4)},{c.longitude?.toFixed(4)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>No mapped businesses available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
