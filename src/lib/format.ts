/**
 * Canadian-English formatting helpers. Prices on GenericOrNot are Canadian
 * dollars; dates use the en-CA locale.
 */

const cadFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const cadPreciseFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

/** "$4.99". en-CA renders CAD with a bare "$", which is what Canadians expect. */
export function formatCAD(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "";
  return cadFormatter.format(amount);
}

/** Like formatCAD but keeps a third decimal for sub-dollar unit prices ("$0.045"). */
export function formatCADPrecise(amount: number): string {
  return amount < 1 ? cadPreciseFormatter.format(amount) : cadFormatter.format(amount);
}

function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

/** "Mar. 4, 2026" */
export function formatDate(date: Date | string): string {
  return toDate(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/Toronto",
  });
}

/** "March 2026" */
export function formatMonthYear(date: Date | string): string {
  return toDate(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    timeZone: "America/Toronto",
  });
}

export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const diffMs = now.getTime() - toDate(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}
