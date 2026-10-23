export default function GlobalLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-background" role="status" aria-live="polite">
      <style>{`
        @keyframes wh-ink { 0%,100% { opacity: .15 } 50% { opacity: 1 } }
        .wh-ink > span { animation: wh-ink 1.6s ease-in-out infinite; }
        .wh-ink > span:nth-child(2) { animation-delay: .2s }
        .wh-ink > span:nth-child(3) { animation-delay: .4s }
        .wh-ink > span:nth-child(4) { animation-delay: .6s }
        @media (prefers-reduced-motion: reduce) { .wh-ink > span { animation: none; opacity: 1 } }
      `}</style>
      <div className="flex flex-col items-center gap-5">
        <div className="wh-ink flex border-y border-l border-grid">
          {['東', '山', '文', '薈'].map((c) => (
            <span key={c} className="flex size-12 items-center justify-center border-r border-grid font-serif text-2xl font-bold">
              {c}
            </span>
          ))}
        </div>
        <span className="font-serif text-xs tracking-[0.15em] text-muted-foreground">載入中</span>
      </div>
    </div>
  )
}
