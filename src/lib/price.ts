export function formatPrice(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `JOD ${n.toFixed(3)}`;
}