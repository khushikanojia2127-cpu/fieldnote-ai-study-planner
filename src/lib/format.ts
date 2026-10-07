export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat("en", options).format(date);
}
