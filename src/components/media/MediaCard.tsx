import React from 'react';
import { Link } from 'react-router-dom';
import Artwork from '../ui/Artwork';

export interface MediaCardProps {
  to: string;
  title: string;
  subtitle?: string;
  artwork?: string;
  /** Seeds the fallback gradient — pass the entity id. */
  seed?: string;
  onPlay?: () => void;
  /** True when this collection is the one currently playing. */
  isPlaying?: boolean;
  /** Circular artwork, for artists. */
  round?: boolean;
  /** Fallback glyph when there is no artwork. */
  icon?: string;
  className?: string;
}

/**
 * Square (or circular) collection card with a hover play affordance.
 *
 * The artwork is covered by a decorative link so mouse users can click the
 * image, while the accessible name and keyboard focus live on the single title
 * link — the play control is a sibling of both, since a button may not be
 * nested inside an anchor.
 */
export const MediaCard: React.FC<Readonly<MediaCardProps>> = ({
  to,
  title,
  subtitle,
  artwork,
  seed,
  onPlay,
  isPlaying = false,
  round = false,
  icon,
  className = '',
}) => (
  <div className={`group ${round ? 'text-center' : ''} ${className}`}>
    <div className="relative mb-4">
      <Artwork
        src={artwork}
        alt={title}
        seed={seed ?? title}
        icon={icon}
        fallbackTextClass="text-3xl"
        className={`w-full aspect-square transition-transform duration-500 ${
          round ? 'rounded-full group-hover:scale-105' : 'rounded-2xl'
        }`}
        imageClassName="transition-transform duration-500 group-hover:scale-110"
      />
      <Link
        to={to}
        aria-hidden="true"
        tabIndex={-1}
        className={`absolute inset-0 ${round ? 'rounded-full' : 'rounded-2xl'}`}
      />
      {onPlay && (
        <button
          type="button"
          onClick={onPlay}
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
          className={`absolute bottom-3 right-3 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 ${
            isPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0'
          }`}
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>
      )}
    </div>

    <Link to={to} className="block">
      <h4
        className={`font-bold truncate transition-colors ${
          isPlaying ? 'text-primary' : 'text-on-surface group-hover:text-primary'
        }`}
      >
        {title}
      </h4>
      {subtitle && <p className="text-on-surface-variant text-sm mt-1 line-clamp-2">{subtitle}</p>}
    </Link>
  </div>
);

export default MediaCard;
