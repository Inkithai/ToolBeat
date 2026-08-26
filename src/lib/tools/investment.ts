/**
 * Investment growth forecast: initial deposit + fixed monthly contributions,
 * compounded monthly.
 */

export type InvestmentTerms = {
  /** Initial deposit. */
  initial: number;
  /** Contribution added at the end of each month. */
  monthly: number;
  /** Annual interest rate in percent. */
  annualRatePct: number;
  years: number;
};

export type InvestmentYear = {
  year: number;
  startValue: number;
  contributions: number;
  growth: number;
  endValue: number;
};

export type InvestmentForecast = {
  finalValue: number;
  totalContributed: number;
  totalGrowth: number;
  years: InvestmentYear[];
};

export function investmentForecast(terms: InvestmentTerms): InvestmentForecast {
  const { initial, monthly, annualRatePct, years } = terms;
  if (!Number.isFinite(initial) || initial < 0) throw new Error("The initial deposit must be 0 or more.");
  if (!Number.isFinite(monthly) || monthly < 0) throw new Error("The monthly contribution must be 0 or more.");
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > 100) {
    throw new Error("The annual rate must be between 0 and 100%.");
  }
  if (!Number.isFinite(years) || years <= 0) throw new Error("The term must be more than 0 years.");
  if (years > 600) throw new Error("Keep the term at 600 years or less.");

  const monthlyRate = annualRatePct / 100 / 12;
  let value = initial;
  const yearRows: InvestmentYear[] = [];
  let contributions = 0;
  let growth = 0;
  let prevContributions = 0;
  let prevGrowth = 0;
  let yearStart = initial;

  for (let month = 1; month <= Math.round(years * 12); month++) {
    const interest = value * monthlyRate;
    value = value + interest + monthly;
    contributions += monthly;
    growth += interest;
    if (month % 12 === 0) {
      yearRows.push({
        year: month / 12,
        startValue: yearStart,
        contributions: contributions - prevContributions,
        growth: growth - prevGrowth,
        endValue: value,
      });
      prevContributions = contributions;
      prevGrowth = growth;
      yearStart = value;
    }
  }

  return {
    finalValue: value,
    totalContributed: initial + contributions,
    totalGrowth: growth,
    years: yearRows,
  };
}
