export function MarqueeBanner() {
  const text = "FREE SHIPPING ON ORDERS OVER $100 • NEW ARRIVALS WEEKLY • SUSTAINABLE FASHION • "

  return (
    <div className="bg-[#2E5E99] text-[#E7F0FA] py-2 sm:py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] mx-4"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
