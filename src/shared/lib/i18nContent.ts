export function pickLocale(field: any, language: string, fallback = 'uk'): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[language] || field[fallback] || Object.values(field).find(Boolean) || '';
}

export function pickPrice(priceField: any, currency: string, fallback = 'UAH'): number {
  if (typeof priceField === 'number') return priceField;
  if (!priceField) return 0;
  return priceField[currency] ?? priceField[fallback] ?? 0;
}
