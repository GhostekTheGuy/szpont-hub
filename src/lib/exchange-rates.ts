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
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error('Failed to fetch rates');

    const data = await res.json();
    const usd = Number(data.rates?.USD);
    const eur = Number(data.rates?.EUR);
    if (!isFinite(usd) || !isFinite(eur) || usd <= 0 || eur <= 0) {
      throw new Error('Invalid rate values from API');
    }
    cachedRates = {
      PLN: 1,
      USD: usd,
      EUR: eur,
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

// --- Historyczne kursy walut ---

export type HistoricalRates = Record<string, ExchangeRates>;

const historicalCache = new Map<string, { data: HistoricalRates; timestamp: number }>();
const HISTORICAL_CACHE_DURATION = 15 * 60 * 1000; // 15 min

export async function getHistoricalRates(
  startDate: string,
  endDate: string
): Promise<HistoricalRates> {
  const cacheKey = `${startDate}_${endDate}`;
  const now = Date.now();
  const cached = historicalCache.get(cacheKey);
  if (cached && now - cached.timestamp < HISTORICAL_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/${startDate}..${endDate}?from=PLN&to=USD,EUR`,
      { next: { revalidate: 900 }, signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) throw new Error('Failed to fetch historical rates');

    const json = await res.json();
    const result: HistoricalRates = {};

    // Frankfurter zwraca { rates: { "2026-01-01": { USD: 0.25, EUR: 0.23 }, ... } }
    const ratesData = json.rates || {};
    let lastRates: ExchangeRates = FALLBACK_RATES;

    // Wypełnij każdy dzień w zakresie (w tym weekendy — użyj ostatniego dostępnego kursu)
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (ratesData[dateStr]) {
        lastRates = {
          PLN: 1,
          USD: ratesData[dateStr].USD,
          EUR: ratesData[dateStr].EUR,
        };
      }
      result[dateStr] = lastRates;
      current.setDate(current.getDate() + 1);
    }

    historicalCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    // Fallback: zwróć stały kurs dla każdego dnia
    const result: HistoricalRates = {};
    const current = new Date(startDate);
    const end = new Date(endDate);
    const fallback = cachedRates || FALLBACK_RATES;
    while (current <= end) {
      result[current.toISOString().split('T')[0]] = fallback;
      current.setDate(current.getDate() + 1);
    }
    return result;
  }
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
