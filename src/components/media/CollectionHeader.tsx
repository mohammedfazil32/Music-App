import React from 'react';
import Artwork from '../ui/Artwork';

export interface CollectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  artwork?: string;
  seed?: string;
  icon?: string;
  /** Line of counts under the title, e.g. "12 songs · 48 min". */
  meta?: React.ReactNode;
  round?: boolean;
  /** Controls row. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Shared hero for playlists, albums, artists, genres and Liked Songs.
 *
 * Tonal layering only — the ambient glow behind the artwork does the work a
 * border would otherwise do, per the design system's no-line rule.
 */
export const CollectionHeader: React.FC<Readonly<CollectionHeaderProps>> = ({
  eyebrow,
  title,
  description,
  artwork,
  seed,
  icon,
  meta,
  round = false,
  children,
  className = '',
}) => (
  <header className={`relative mb-12 ${className}`}>
    <div className="absolute -top-16 -left-10 w-[45%] h-[130%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

    <div className="relative flex flex-col md:flex-row items-start md:items-end gap-8">
      <Artwork
        src={artwork}
        alt={title}
        seed={seed ?? title}
        icon={icon}
        fallbackTextClass="text-5xl"
        className={`w-52 h-52 shrink-0 shadow-[0_30px_60px_rgba(0,0,0,0.5)] ${round ? 'rounded-full' : 'rounded-2xl'}`}
      />

      <div className="min-w-0 flex-1">
        {eyebrow && (
          <span className="text-tertiary font-bold tracking-[0.3em] text-[10px] uppercase mb-3 block">{eyebrow}</span>
        )}
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-3 break-words">{title}</h1>
        {description && <p className="text-on-surface-variant text-base max-w-2xl mb-3">{description}</p>}
        {meta && (
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">{meta}</p>
        )}
        {children}
      </div>
    </div>
  </header>
);

export default CollectionHeader;
