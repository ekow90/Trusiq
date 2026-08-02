import { Link } from 'react-router-dom'
import { APP_NAME } from '../../constants/app'
import { Button } from './Button'

export function Navbar() {
  return (
    <header className="border-b border-[#dfe8df] bg-white/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-md bg-[#17211c] text-white">
            T
          </span>
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[#5d6b62] md:flex">
          <a href="#discover">Discover</a>
          <a href="#trust">Trust Score</a>
          <a href="#ai">AI Insights</a>
        </nav>

        <Button icon="bi-plus-lg">Add Business</Button>
      </div>
    </header>
  )
}
