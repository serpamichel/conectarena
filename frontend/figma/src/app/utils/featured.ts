import { type Event } from '../data/mockData';

export function isFeaturedActive(
  event: Pick<Event, 'featured' | 'featuredUntil'>,
  now: Date = new Date()
): boolean {
  if (!event.featured) return false;

  if (!event.featuredUntil) return true;

  const expiresAt = new Date(event.featuredUntil);
  if (Number.isNaN(expiresAt.getTime())) return true;

  return now.getTime() < expiresAt.getTime();
}
