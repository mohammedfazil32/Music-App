import React, { useState } from 'react';
import { gradientFor, initialsFor } from '../../lib/gradient';

export interface ArtworkProps {
  src?: string;
  /** Describes the image for assistive tech; also seeds the fallback initials. */
  alt: string;
  /** Overrides what the fallback gradient is derived from (usually an id). */
  seed?: string;
  className?: string;
  /** Material Symbols glyph shown instead of initials, e.g. `queue_music`. */
  icon?: string;
  /** Tailwind text size for the fallback glyph/initials. */
  fallbackTextClass?: string;
  imageClassName?: string;
}

/**
 * Cover art that can never render broken.
 *
 * Remote artwork in this catalog comes from a CDN that may be offline or
 * expired, so a failed load (or a missing `src`, as with a new empty playlist)
 * falls back to a deterministic tonal gradient with the item's initials.
 */
export const Artwork: React.FC<Readonly<ArtworkProps>> = ({
  src,
  alt,
  seed,
  className = '',
  icon,
  fallbackTextClass = 'text-xl',
  imageClassName = '',
}) => {
  // Remember *which* url failed rather than a boolean, so a new `src` gets a
  // fresh attempt without an effect resetting the flag.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = !src || failedSrc === src;

  return (
    <div
      className={`relative overflow-hidden bg-surface-container-low ${className}`}
      style={showFallback ? { backgroundImage: gradientFor(seed ?? alt) } : undefined}
      role={showFallback ? 'img' : undefined}
      aria-label={showFallback ? alt : undefined}
    >
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
          className={`w-full h-full object-cover ${imageClassName}`}
        />
      )}
      {showFallback && (
        <span className="absolute inset-0 flex items-center justify-center text-on-surface/70" aria-hidden="true">
          {icon ? (
            <span className={`material-symbols-outlined ${fallbackTextClass}`}>{icon}</span>
          ) : (
            <span className={`font-extrabold tracking-tighter ${fallbackTextClass}`}>{initialsFor(alt)}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default Artwork;
