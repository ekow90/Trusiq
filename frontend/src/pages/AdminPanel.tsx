import { Link } from "react-router-dom";

export function AdminPanel() {
  return (
    <div className="min-h-screen bg-[#f4f9fc] text-[#12304a]">
      <div className="trusiq-shell mx-auto max-w-[920px] px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black">Admin Panel</h1>
          <div className="text-sm text-[#657b8b]">Administrator</div>
        </header>

        <main className="grid gap-6">
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-black">Site Administration</h2>
            <p className="mt-2 text-sm text-[#657b8b]">
              Manage users, review trust computations, and system settings.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/"
                className="rounded px-3 py-2 bg-[#1b6fcf] text-white font-black"
              >
                Open Home
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
