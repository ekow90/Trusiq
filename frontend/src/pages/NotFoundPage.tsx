import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#4f7c5c]">
        404
      </p>
      <h1 className="mt-3 text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-[#5d6b62]">
        This route does not exist yet in the Trusiq frontend.
      </p>
      <Link to="/" className="mt-8">
        <Button icon="bi-arrow-left">Back Home</Button>
      </Link>
    </section>
  )
}
