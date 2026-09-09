import { resolveMediaPath } from '@/lib/media-paths';

export function redirectHistoricalMedia(request: Request) {
  const url = new URL(request.url);
  const destination = resolveMediaPath(url.pathname);
  if (destination === url.pathname || !destination.startsWith('/')) {
    return new Response('Not found', { status: 404 });
  }
  return Response.redirect(new URL(destination, url.origin), 308);
}
