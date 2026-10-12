export const currency = (value: number | null) => value === null
  ? "N/A"
  : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export const count = (value: number | null) => value === null
  ? "N/A"
  : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const percent = (value: number | null) => value === null ? "N/A" : `${value.toFixed(1)}%`;

export const periodLabel = (start: string, end: string) => {
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${format.format(new Date(`${start}T12:00:00Z`))}-${format.format(new Date(`${end}T12:00:00Z`))}`;
};
