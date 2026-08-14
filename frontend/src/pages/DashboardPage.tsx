import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isOwner = user.roles.includes("owner");
  const isCustomer = user.roles.includes("customer");

  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell mx-auto max-w-[920px] px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black">Dashboard</h1>
          <div className="text-sm text-[#657b8b]">Signed in as {user.name}</div>
        </header>

        <main className="grid gap-6">
          {isOwner && (
            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-black">Business Owner Dashboard</h2>
              <p className="mt-2 text-sm text-[#657b8b]">
                Access your business analytics, trust score and verification
                tools.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/trust-score"
                  className="rounded px-3 py-2 bg-[#1b6fcf] text-white font-black"
                >
                  View Trust Score
                </Link>
              </div>
            </section>
          )}

          {isCustomer && (
            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-black">Customer Dashboard</h2>
              <p className="mt-2 text-sm text-[#657b8b]">
                Find verified businesses and manage your reviews.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/search"
                  className="rounded px-3 py-2 bg-[#1b6fcf] text-white font-black"
                >
                  Search Businesses
                </Link>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
