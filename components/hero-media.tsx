import { isVideoUrl } from "@/lib/text";

// 首頁封面：網址是影片就靜音自動循環播放，否則當圖片顯示（前台與後台預覽共用）
export function HeroMedia({ src, alt, className = "absolute inset-0 h-full w-full object-cover", video }: { src: string; alt: string; className?: string; video?: boolean }) {
  // video 可由呼叫端指定（後台預覽本機檔案時，blob: 網址沒有副檔名可判斷）
  if (video ?? isVideoUrl(src)) {
    return (
      <video
        src={src}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
