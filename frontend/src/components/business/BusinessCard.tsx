type BusinessCardProps = {
  category: string
  name: string
  trustScore: number
  reviewCount: number
}

export function BusinessCard({
  category,
  name,
  trustScore,
  reviewCount,
}: BusinessCardProps) {
  return (
    <article className="rounded-lg border border-[#dfe8df] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#4f7c5c]">
        {category}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-[#17211c]">{name}</h3>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#5d6b62]">Trust score</p>
          <p className="text-3xl font-semibold">{trustScore}</p>
        </div>
        <p className="text-sm text-[#5d6b62]">{reviewCount} reviews</p>
      </div>
    </article>
  )
}
