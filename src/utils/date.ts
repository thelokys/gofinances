export function asBrazilianDate(date: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    ...options
  }).format(new Date(date))
 }