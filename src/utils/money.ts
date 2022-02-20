export function asBRLCurrency(value: number, options?: Intl.NumberFormatOptions): string {
 return value.toLocaleString(
   'pt-BR', 
    { 
      style: 'currency', currency: 'BRL',
      ...options
    })
}