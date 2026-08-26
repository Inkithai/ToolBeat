/**
 * Loan / EMI math.
 *
 * Standard amortizing loan: fixed monthly payment over the term at a fixed
 * annual rate, compounded monthly. All functions are pure — the UI only
 * renders what comes back.
 */

export type LoanTerms = {
  /** Borrowed amount. */
  principal: number;
  /** Annual interest rate in percent, e.g. 12 for 12%. */
  annualRatePct: number;
  /** Loan term in years. */
  years: number;
};

export type LoanSummary = {
  months: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  /** Interest as a fraction of the total paid, 0–1. */
  interestShare: number;
};

export type AmortizationYear = {
  year: number;
  paidThisYear: number;
  interestThisYear: number;
  principalThisYear: number;
  balanceAfter: number;
};

export function loanSummary({ principal, annualRatePct, years }: LoanTerms): LoanSummary {
  if (!Number.isFinite(principal) || principal <= 0) throw new Error("Enter a loan amount greater than zero.");
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0) throw new Error("Enter an interest rate of zero or more.");
  if (!Number.isFinite(years) || years <= 0) throw new Error("Enter a term of at least one month.");

  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualRatePct / 100 / 12;

  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - principal;

  return {
    months,
    monthlyRate,
    monthlyPayment,
    totalPaid,
    totalInterest,
    interestShare: totalPaid > 0 ? totalInterest / totalPaid : 0,
  };
}

/** One row per year: what was paid, how much of it was interest, and the balance. */
export function amortizationByYear({ principal, annualRatePct, years }: LoanTerms): AmortizationYear[] {
  const { monthlyPayment, monthlyRate } = loanSummary({ principal, annualRatePct, years });
  const rows: AmortizationYear[] = [];
  let balance = principal;

  const fullYears = Math.max(1, Math.round(years));
  for (let year = 1; year <= fullYears; year += 1) {
    let interestThisYear = 0;
    let paidThisYear = 0;
    const monthsInYear = Math.min(12, Math.max(0, Math.round(years * 12) - (year - 1) * 12));
    for (let month = 0; month < monthsInYear && balance > 0; month += 1) {
      const interest = balance * monthlyRate;
      // The final payment settles the remaining balance plus its interest.
      const payment = Math.min(monthlyPayment, balance + interest);
      interestThisYear += interest;
      paidThisYear += payment;
      balance = Math.max(0, balance + interest - payment);
    }
    rows.push({
      year,
      paidThisYear,
      interestThisYear,
      principalThisYear: paidThisYear - interestThisYear,
      balanceAfter: balance,
    });
  }
  return rows;
}

/** Format a monetary amount without assuming a currency symbol. */
export function formatMoney(value: number, fractionDigits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
