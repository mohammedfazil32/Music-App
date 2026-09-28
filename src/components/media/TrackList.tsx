import React from 'react';
import type { PlaybackSource, Track } from '../../types';
import EmptyState from '../ui/EmptyState';
import TrackRow from './TrackRow';

export interface TrackListProps {
  tracks: readonly Track[];
  source: PlaybackSource;
  showAlbum?: boolean;
  /** Header for the optional fourth column. */
  metaLabel?: string;
  metaFor?: (track: Track, index: number) => React.ReactNode;
  /** Provided by editable collections; enables per-row removal. */
  onRemove?: (index: number) => void;
  /** Wording for the remove action, e.g. "Remove from Liked Songs". */
  removeLabel?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/**
 * Column templates. Written as complete literal class strings so Tailwind's
 * scanner can see them — do not build these by concatenation.
 */
const GRIDS = {
  albumAndMeta: 'grid grid-cols-[48px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_150px]',
  albumOnly: 'grid grid-cols-[48px_minmax(0,2fr)_minmax(0,1.5fr)_150px]',
  metaOnly: 'grid grid-cols-[48px_minmax(0,2fr)_minmax(0,1fr)_150px]',
  bare: 'grid grid-cols-[48px_minmax(0,1fr)_150px]',
} as const;

/** Track table with a sticky-feeling header, matching the Stitch list design. */
export const TrackList: React.FC<Readonly<TrackListProps>> = ({
  tracks,
  source,
  showAlbum = true,
  metaLabel,
  metaFor,
  onRemove,
  removeLabel,
  emptyIcon = 'music_note',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  className = '',
}) => {
  const hasMeta = Boolean(metaFor);
  const grid =
    showAlbum && hasMeta
      ? GRIDS.albumAndMeta
      : showAlbum
        ? GRIDS.albumOnly
        : hasMeta
          ? GRIDS.metaOnly
          : GRIDS.bare;

  if (tracks.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={`bg-surface-container-low rounded-xl ${className}`}>
      <div
        className={`${grid} gap-4 px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant`}
        aria-hidden="true"
      >
        <div className="text-center">#</div>
        <div>Title</div>
        {showAlbum && <div>Album</div>}
        {hasMeta && <div>{metaLabel}</div>}
        <div className="text-right pr-1">Time</div>
      </div>

      <div>
        {tracks.map((track, index) => (
          <TrackRow
            key={`${track.id}-${index}`}
            track={track}
            index={index}
            tracks={tracks}
            source={source}
            gridClassName={grid}
            showAlbum={showAlbum}
            meta={metaFor ? metaFor(track, index) : undefined}
            onRemove={onRemove ? () => onRemove(index) : undefined}
            removeLabel={removeLabel}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackList;
