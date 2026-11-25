import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
  alt,
}: {
  images: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  alt: string;
}) {
  const { t, dir } = useLang();
  const open = index !== null;
  const next = useCallback(() => index !== null && onIndex((index + 1) % images.length), [index, images.length, onIndex]);
  const prev = useCallback(
    () => index !== null && onIndex((index - 1 + images.length) % images.length),
    [index, images.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") (dir === "rtl" ? prev : next)();
      if (e.key === "ArrowLeft") (dir === "rtl" ? next : prev)();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, next, prev, dir]);

  if (index === null) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4 animate-in fade-in" onClick={onClose}>
      <button
        type="button"
        className="absolute top-5 end-5 flex h-11 w-11 items-center justify-center rounded-full border border-border text-ivory hover:border-primary"
        onClick={onClose}
        aria-label={t("close")}
      >
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute start-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border text-ivory hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
          >
            {dir === "rtl" ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </button>
          <button
            type="button"
            className="absolute end-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border text-ivory hover:border-primary"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
          >
            {dir === "rtl" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </button>
        </>
      )}
      <img
        key={images[index]}
        src={images[index]}
        alt={alt}
        className="max-h-[86vh] max-w-full rounded-xl object-contain animate-in zoom-in-95 fade-in duration-500"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tracking-widest text-ivory/70">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
