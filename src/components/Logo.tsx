interface Props {
  /** Pixel size of the square mark. */
  size?: number;
  /** Show the "Synth Key" wordmark next to the mark. */
  withWordmark?: boolean;
}

/**
 * Minimalist Synth Key logo: a rounded tile holding a sound wave riding over a
 * hint of piano keys — "synth" + "key".
 */
export function Logo({ size = 40, withWordmark = true }: Props) {
  return (
    <span className="logo">
      <svg
        className="logo-mark"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Synth Key logo"
      >
        <defs>
          <linearGradient id="sk-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7aa2ff" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <rect x="3" y="3" width="42" height="42" rx="12" fill="url(#sk-grad)" />

        {/* piano keys along the lower half */}
        <g>
          <rect x="11" y="26" width="26" height="13" rx="2.5" fill="#f4f5f8" />
          <rect x="18.5" y="26" width="3.5" height="8" rx="1.2" fill="#0e0f13" />
          <rect x="26" y="26" width="3.5" height="8" rx="1.2" fill="#0e0f13" />
        </g>

        {/* sound wave */}
        <path
          d="M10 18 Q 14 9 18 18 T 26 18 Q 30 27 34 18 T 38 18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {withWordmark && (
        <span className="logo-wordmark">
          <span className="logo-synth">Synth</span>
          <span className="logo-key">Key</span>
        </span>
      )}
    </span>
  );
}
