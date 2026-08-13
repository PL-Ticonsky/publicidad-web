/**
 * Política monetaria del cotizador.
 *
 * - Unidad interna: pesos colombianos (COP) enteros.
 * - IVA: una sola tasa expresada en puntos básicos (19 % = 1.900 pb).
 * - Redondeo: se suman primero todas las líneas con precio conocido, se calcula
 *   el IVA una sola vez y se redondea al COP más cercano con Math.round.
 * - El total es la suma exacta del subtotal entero y el IVA ya redondeado.
 *
 * La tasa y su aplicabilidad todavía requieren aprobación comercial/fiscal.
 */
export const IVA_RATE_BASIS_POINTS = 1_900;
export const BASIS_POINTS_PER_UNIT = 10_000;

export function assertWholeCop(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} debe estar expresado en COP enteros y seguros.`);
  }
}

export function multiplyCop(unitAmountCop: number, quantity: number, label: string): number {
  assertWholeCop(unitAmountCop, label);
  const result = unitAmountCop * quantity;
  assertWholeCop(result, label);
  return result;
}

export function addCop(amounts: readonly number[], label: string): number {
  const result = amounts.reduce((total, amount) => {
    assertWholeCop(amount, label);
    return total + amount;
  }, 0);
  assertWholeCop(result, label);
  return result;
}

export function calculateTaxCop(subtotalCop: number): number {
  assertWholeCop(subtotalCop, "El subtotal");
  const wholeUnits = Math.floor(subtotalCop / BASIS_POINTS_PER_UNIT);
  const remainderCop = subtotalCop % BASIS_POINTS_PER_UNIT;
  const taxCop = (wholeUnits * IVA_RATE_BASIS_POINTS)
    + Math.round((remainderCop * IVA_RATE_BASIS_POINTS) / BASIS_POINTS_PER_UNIT);
  assertWholeCop(taxCop, "El IVA");
  return taxCop;
}

export function formatTaxRate(): string {
  const percentage = IVA_RATE_BASIS_POINTS / 100;
  return `${percentage.toLocaleString("es-CO", { maximumFractionDigits: 2 })} %`;
}
