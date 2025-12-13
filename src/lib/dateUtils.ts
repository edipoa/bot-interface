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
    const [year, month, day] = dateString.split('-').map(Number);
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
