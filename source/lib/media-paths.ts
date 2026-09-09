import displaySource from '@/sites-media-display-map.json';
import webSource from '@/content/web-media-v24.json';
import portraitSource from '@/content/portrait-media-v24.json';

const displayPaths = displaySource as Record<string, string>;
const webPaths = webSource.paths as Record<string, string>;
const portraitPaths = portraitSource.paths as Record<string, string>;

// One resolver for cards, article bodies, profile pages and historical URLs.
// Only exact duplicate article files share storage; their bytes stay unchanged.
export function resolveMediaPath(value: string) {
  const normalized = value.replaceAll('%25', '%').replaceAll('%40', '@');
  const display = displayPaths[value] ?? displayPaths[normalized] ?? normalized;
  return portraitPaths[value] ?? portraitPaths[normalized] ?? portraitPaths[display]
    ?? webPaths[display] ?? display;
}
