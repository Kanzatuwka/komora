const LOCALE_BY_LANG: Record<string, string> = { 
  uk: 'uk-UA', 
  en: 'en-US', 
  de: 'de-DE' 
};

export function formatDate(date: any, language: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  if (!date) return '';
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date.toDate === 'function') {
    d = date.toDate();
  } else {
    d = new Date(date);
  }
  return new Intl.DateTimeFormat(LOCALE_BY_LANG[language] || 'uk-UA', opts).format(d);
}

export function formatPrice(price: any, currency: string | undefined, language: string): string {
  const currencyCode = currency || 'UAH';
  const amount = typeof price === 'number' ? price : (price?.[currencyCode] || price?.['UAH'] || 0);
  
  try {
    return new Intl.NumberFormat(LOCALE_BY_LANG[language] || 'uk-UA', { 
      style: 'currency', 
      currency: currencyCode 
    }).format(amount);
  } catch (e) {
    console.error('formatPrice error:', e, { price, currency, language });
    return `${amount} ${currencyCode}`;
  }
}
