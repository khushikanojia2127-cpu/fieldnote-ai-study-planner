export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function getLocalDateSettings(): { locale: string; timeZone: string } {
  const { locale, timeZone } = new Intl.DateTimeFormat().resolvedOptions();
  return {
    locale: locale || "en",
    timeZone: timeZone || "UTC",
  };
}

function formatLocalDate(
  date: Date,
  options: Intl.DateTimeFormatOptions,
): string {
  const { locale, timeZone } = getLocalDateSettings();
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return formatLocalDate(date, options);
}

export function formatDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (!value) return "";
  const dateValue = value.trim();
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
  const date = new Date(dateOnly ? `${dateValue}T12:00:00` : dateValue);
  return formatLocalDate(date, options);
}
