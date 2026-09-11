export default function GlobalLoading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center bg-background">
      {/* 💡 注入專屬的文學風呼吸與延伸動畫 */}
      <style>{`
        @keyframes blurFade {
          0% { opacity: 0.3; filter: blur(2px); transform: translateY(2px); }
          50% { opacity: 1; filter: blur(0px); transform: translateY(0px); }
          100% { opacity: 0.3; filter: blur(2px); transform: translateY(2px); }
        }
        @keyframes lineExpand {
          0% { width: 0%; opacity: 0; }
          50% { width: 60px; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
        .animate-blur-fade {
          animation: blurFade 3s ease-in-out infinite;
        }
        .animate-line-expand {
          animation: lineExpand 3s ease-in-out infinite;
        }
        .dot-1 { animation: blurFade 1.5s infinite; animation-delay: 0s; }
        .dot-2 { animation: blurFade 1.5s infinite; animation-delay: 0.2s; }
        .dot-3 { animation: blurFade 1.5s infinite; animation-delay: 0.4s; }
      `}</style>
      
      <div className="flex flex-col items-center gap-6">
        {/* 1. 品牌字體（柔焦呼吸效果） */}
        <span className="font-serif text-2xl tracking-[0.4em] text-foreground pl-[0.4em] animate-blur-fade">
          東山文薈
        </span>
        
        {/* 2. 動態伸縮裝飾線 */}
        <div className="h-[1px] bg-foreground/40 animate-line-expand" />
        
        {/* 3. 載入中字樣與漣漪點點 */}
        <span className="flex items-center font-serif text-xs tracking-[0.2em] text-muted-foreground">
          載入中
          <span className="flex ml-1 tracking-normal">
            <span className="dot-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </span>
        </span>
      </div>
    </div>
  )
}