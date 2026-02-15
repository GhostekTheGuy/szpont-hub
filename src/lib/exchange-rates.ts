export type Currency = 'PLN' | 'USD' | 'EUR';

export type ExchangeRates = Record<Currency, number>;

// Cache kursów na 1h (server-side)
let cachedRates: ExchangeRates | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1h

const FALLBACK_RATES: ExchangeRates = {
  PLN: 1,
  USD: 0.25,
  EUR: 0.23,
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && now - cacheTimestamp < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=PLN&to=USD,EUR', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Failed to fetch rates');

    const data = await res.json();
    cachedRates = {
      PLN: 1,
      USD: data.rates.USD,
      EUR: data.rates.EUR,
    };
    cacheTimestamp = now;
    return cachedRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Użyj cached rates jeśli są, inaczej fallback
    if (cachedRates) return cachedRates;
    return FALLBACK_RATES;
  }
}

export function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;

  // Przelicz przez PLN jako walutę bazową
  // rates zawiera kursy FROM PLN TO X
  // Więc: PLN -> USD = amount * rates.USD
  //       USD -> PLN = amount / rates.USD
  //       USD -> EUR = (amount / rates.USD) * rates.EUR

  const amountInPLN = fromCurrency === 'PLN' ? amount : amount / rates[fromCurrency];
  return toCurrency === 'PLN' ? amountInPLN : amountInPLN * rates[toCurrency];
}

const currencySymbols: Record<Currency, string> = {
  PLN: 'zł',
  USD: '$',
  EUR: '€',
};

const currencyLocales: Record<Currency, string> = {
  PLN: 'pl-PL',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function formatCurrency(amount: number, currency: Currency = 'PLN'): string {
  return amount.toLocaleString(currencyLocales[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
