export function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}
