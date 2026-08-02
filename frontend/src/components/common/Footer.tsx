import { APP_NAME } from '../../constants/app'

export function Footer() {
  return (
    <footer className="border-t border-[#dfe8df] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-[#5d6b62] md:flex-row md:items-center md:justify-between">
        <p>{APP_NAME} trust intelligence platform.</p>
        <p>Built for consumers, local businesses, and verified organizations.</p>
      </div>
    </footer>
  )
}
