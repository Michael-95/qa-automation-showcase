/** "$29.99" or "Item total: $39.98" -> 29.99 / 39.98 */
export function parseMoney(text: string): number {
  const match = text.match(/\$\s*([\d,]+\.\d{2})/);
  if (!match) throw new Error(`No dollar amount found in "${text}"`);
  return Number(match[1].replace(/,/g, ''));
}

/** Sum in integer cents to avoid floating-point drift, return dollars. */
export function sumMoney(values: number[]): number {
  return values.reduce((cents, v) => cents + Math.round(v * 100), 0) / 100;
}
