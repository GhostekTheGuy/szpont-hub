export interface TaxBreakdown {
  grossIncome: number;
  pitTax: number;
  healthInsurance: number;
  netIncome: number;
  effectiveRate: number;
}

/**
 * Oblicza szacunkowy PIT i składki od miesięcznego brutto.
 * PIT: 12% do 120k PLN rocznie (10k/mies.), 32% powyżej.
 * Składka zdrowotna: 9%.
 */
export function calculatePIT(monthlyGross: number): TaxBreakdown {
  if (monthlyGross <= 0) {
    return { grossIncome: 0, pitTax: 0, healthInsurance: 0, netIncome: 0, effectiveRate: 0 };
  }

  const MONTHLY_THRESHOLD = 10_000; // 120k / 12
  const RATE_LOW = 0.12;
  const RATE_HIGH = 0.32;
  const HEALTH_RATE = 0.09;

  let pitTax: number;
  if (monthlyGross <= MONTHLY_THRESHOLD) {
    pitTax = monthlyGross * RATE_LOW;
  } else {
    pitTax = MONTHLY_THRESHOLD * RATE_LOW + (monthlyGross - MONTHLY_THRESHOLD) * RATE_HIGH;
  }

  const healthInsurance = monthlyGross * HEALTH_RATE;
  const netIncome = monthlyGross - pitTax - healthInsurance;
  const effectiveRate = ((pitTax + healthInsurance) / monthlyGross) * 100;

  return {
    grossIncome: monthlyGross,
    pitTax,
    healthInsurance,
    netIncome,
    effectiveRate,
  };
}
