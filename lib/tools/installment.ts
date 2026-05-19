export function calculateInstallment(price: number, tenor: number) {
  // Bunga rata-rata cicilan e-commerce/paylater (misal 2.95% per bulan)
  const interestRate = 0.0295;
  const adminFee = 10000; // flat admin fee
  
  const baseMonthly = price / tenor;
  const interestMonthly = price * interestRate;
  
  const totalMonthly = Math.round(baseMonthly + interestMonthly + (adminFee / tenor));
  
  return {
    price,
    tenor,
    monthlyPayment: totalMonthly,
    totalPayment: totalMonthly * tenor,
    note: "Ini adalah estimasi cicilan. Angka asli mungkin berbeda tergantung penyedia paylater (Akulaku, Kredivo, SPayLater, dll)."
  };
}
