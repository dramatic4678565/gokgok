import { cn } from "@/lib/utils";

/**
 * Stand-in gradients, chosen deterministically from the board id so a given
 * board always gets the same placeholder and the grid does not reshuffle on
 * every render.
 */
const GRADIENTS = [
  "from-indigo-500/80 to-violet-500/80",
  "from-sky-500/80 to-cyan-500/80",
  "from-emerald-500/80 to-teal-500/80",
  "from-amber-500/80 to-orange-500/80",
  "from-rose-500/80 to-pink-500/80",
  "from-fuchsia-500/80 to-purple-500/80",
  "from-blue-500/80 to-indigo-500/80",
  "from-lime-500/80 to-green-500/80",
];

function hash(value: string): number {
  let out = 0;
  for (let index = 0; index < value.length; index += 1) {
    out = (out << 5) - out + value.charCodeAt(index);
    out |= 0;
  }
  return Math.abs(out);
}

function MosaicMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
        fill="currentColor"
      />
    </svg>
  );
}

type BoardThumbnailProps = {
  id: string;
  thumbnail: string | null;
  className?: string;
  /** Trashed boards render their thumbnail in greyscale. */
  muted?: boolean;
  children?: React.ReactNode;
};

export function BoardThumbnail({
  id,
  thumbnail,
  className,
  muted = false,
  children,
}: BoardThumbnailProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        "aspect-video w-full",
        className,
      )}
    >
      {thumbnail ? (
        // Thumbnails are arbitrary user-supplied URLs, so `next/image` would
        // add nothing and would reject non-raster sources.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          className={cn("size-full object-cover", muted && "grayscale")}
        />
      ) : (
        <div
          className={cn(
            "grid size-full place-items-center bg-gradient-to-br",
            GRADIENTS[hash(id) % GRADIENTS.length],
            muted && "grayscale",
          )}
        >
          <MosaicMark className="size-8 text-white/80" />
        </div>
      )}

      {children}
    </div>
  );
}
