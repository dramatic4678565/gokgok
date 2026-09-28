import "./MosaicLogo.scss";

/**
 * The Mosaic mark: a 2x2 grid of tiles in a single blue ramp.
 *
 * A mosaic is small pieces assembled into one whole, which is what a
 * whiteboard does -- many simple elements composed into a single picture.
 */
const LogoIcon = () => (
  <svg
    viewBox="0 0 132 132"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="MosaicLogo-icon"
  >
    <rect x="0" y="0" width="60" height="60" rx="16" fill="#3977df" />
    <rect x="72" y="0" width="60" height="60" rx="16" fill="#8fb4f2" />
    <rect x="0" y="72" width="60" height="60" rx="16" fill="#5f96ea" />
    <rect x="72" y="72" width="60" height="60" rx="16" fill="#c7dbfb" />
  </svg>
);

/**
 * The wordmark is drawn as strokes rather than set in a font, so it renders
 * identically on every platform and never needs a webfont. It inherits
 * `currentColor`, so it follows the surrounding theme.
 */
const LogoText = () => (
  <svg
    viewBox="0 0 495 112"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    className="MosaicLogo-text"
    stroke="currentColor"
    strokeWidth="17"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* M */}
    <path d="M13 96 L13 9 L45 62 L77 9 L77 96" />
    {/* o */}
    <circle cx="140" cy="52" r="30" />
    {/* s */}
    <path d="M249 28 C240 14 212 12 203 27 C194 42 208 49 225 55 C242 61 250 69 242 83 C233 98 205 96 194 82" />
    {/* a */}
    <circle cx="306" cy="52" r="30" />
    <path d="M336 23 L336 96" />
    {/* i */}
    <path d="M382 27 L382 96" />
    {/* c */}
    <path d="M478 28 C469 12 435 10 421 28 C407 46 407 62 421 78 C435 94 469 92 478 76" />
  </svg>
);

type LogoProps = {
  style?: React.CSSProperties;
  size?: "mobile" | "xs" | "small" | "normal" | "large";
  withText?: boolean;
  isNotLink?: boolean;
};

export const MosaicLogo = ({
  style,
  size = "small",
  withText,
}: LogoProps) => {
  return (
    <div className={`MosaicLogo is-${size}`} style={style}>
      <LogoIcon />
      {withText && <LogoText />}
    </div>
  );
};
