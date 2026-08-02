import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-[#1f2430]">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
