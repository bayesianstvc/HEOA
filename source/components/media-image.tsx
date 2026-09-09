'use client';

import { Highlighter, ImageOff } from 'lucide-react';
import { useState, type ImgHTMLAttributes } from 'react';
import type { MediaVariant, MediaVariants } from '@/lib/content';

type MediaImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  assetId?: string | null;
  media?: MediaVariants | null;
  sources?: Partial<Record<MediaVariant, string>>;
  variant?: MediaVariant;
  allowOriginal?: boolean;
  fallbackLabel?: string;
};

export function MediaImage({
  assetId,
  media,
  sources,
  variant = 'display',
  allowOriginal = false,
  fallbackLabel = '媒体暂不可用',
  className = '',
  onLoad,
  onError,
  src,
  alt,
  ...props
}: MediaImageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [requestedVariant, setRequestedVariant] = useState<MediaVariant>(variant);
  // The server repository resolves assetId. Never bundle the content database
  // into this client component just to resolve a media URL.
  const resolvedSource = sources?.[requestedVariant] ?? src;
  const hasOriginal = Boolean(sources?.original && sources.original !== (sources.display ?? src));

  return <span className={`media-frame media-${state === 'error' ? 'failed' : state}`} data-asset-id={assetId ?? media?.displayAssetId ?? undefined}>
    <span className="media-skeleton" aria-hidden="true" />
    {resolvedSource ? <img
      {...props}
      src={resolvedSource}
      alt={alt ?? ''}
      className={className}
      onLoad={(event) => { setState('ready'); onLoad?.(event); }}
      onError={(event) => { setState('error'); onError?.(event); }}
    /> : <span className="media-missing"><ImageOff aria-hidden="true"/><span className="sr-only">{alt ?? fallbackLabel}</span></span>}
    {allowOriginal && hasOriginal && state !== 'error' && <button
      className="media-quality-toggle"
      type="button"
      aria-pressed={requestedVariant === 'original'}
      aria-label={requestedVariant === 'original' ? '切换展示图' : '查看高清原图'}
      onClick={() => { setState('loading'); setRequestedVariant((value) => value === 'original' ? 'display' : 'original'); }}
    ><Highlighter aria-hidden="true"/><span>{requestedVariant === 'original' ? '展示图' : '高清'}</span></button>}
    {state === 'error' && <span className="media-error" aria-live="polite"><ImageOff aria-hidden="true"/>{fallbackLabel}</span>}
  </span>;
}
