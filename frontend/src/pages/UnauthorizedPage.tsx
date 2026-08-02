import React from "react";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <h2 className="mb-4 text-2xl font-black text-[#12304a]">
          Unauthorized
        </h2>
        <p className="mb-6 text-sm text-[#657b8b]">
          You do not have access to view this page.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-[#12304a] px-4 py-2 text-sm font-black text-white"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
