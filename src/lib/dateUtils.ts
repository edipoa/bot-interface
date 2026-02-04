/**
 * Format a date string (YYYY-MM-DD) to localized format without timezone issues
 * 
 * When using `new Date('2025-12-11')`, JavaScript interprets it as UTC midnight,
 * which can result in the previous day when converted to local timezone (e.g., UTC-3).
 * This function parses the date components directly to avoid timezone conversion.
 * 
 * @param dateString - Date in YYYY-MM-DD format
 * @param locale - Locale for formatting (default: 'pt-BR')
 * @returns Formatted date string
 */
export function formatDateWithoutTimezone(dateString: string, locale: string = 'pt-BR'): string {
    // Parse YYYY-MM-DD format directly without timezone conversion
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(locale);
}

/**
 * Format a date string to a specific format
 * 
 * @param dateString - Date in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @param locale - Locale for formatting (default: 'pt-BR')
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string,
    options?: Intl.DateTimeFormatOptions,
    locale: string = 'pt-BR'
): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(locale, options);
}

/**
 * Format an ISO date string (from API) showing exactly the date portion without timezone conversion
 * 
 * @param isoDateString - Date in ISO format (e.g., "2025-12-17T03:00:00.000Z")
 * @returns Formatted date string showing the exact date from API
 */
export function formatISODate(isoDateString: string): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format a date string (ISO) to a localized date string respecting the "Wall Time" stored in UTC.
 * Does NOT convert to browser timezone.
 */
export function formatEventDate(isoDateString: string): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();


    return `${day}/${month}/${year}`;
}

export function formatEventTime(isoDateString: string): string {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hh}h${mm}`;
}
