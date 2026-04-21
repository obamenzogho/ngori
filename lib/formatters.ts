import { format, isAfter, subDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateText(text: string, maxLength: number = 150): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength).trim() + '...';
}

export function normalizeName(name: string, dateStr?: string, channelCount?: number): string {
  if (!name) return 'Nom Inconnu';
  
  if (name.toLowerCase() === 'live' || name.toLowerCase() === 'dream tv' || name.toLowerCase() === 'playlist m3u') {
    let suffix = '';
    if (channelCount) {
      suffix += ` - ${channelCount} chaînes`;
    }
    if (dateStr) {
      try {
        const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
        suffix += ` (${format(d, 'MMM yyyy', { locale: fr })})`;
      } catch (e) {
        // ignore date format error
      }
    }
    return `${name}${suffix}`;
  }
  return name;
}

export function isNewItem(dateStr?: string | Date): boolean {
  if (!dateStr) return false;
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    const sevenDaysAgo = subDays(new Date(), 7);
    return isAfter(d, sevenDaysAgo);
  } catch (e) {
    return false;
  }
}

export function formatRelativeDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return 'Date inconnue';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return format(d, 'dd MMMM yyyy', { locale: fr });
  } catch (e) {
    return 'Date invalide';
  }
}
