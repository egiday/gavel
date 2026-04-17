// lightweight haptic feedback — degrades silently on ios safari,
// which doesn't implement navigator.vibrate.

export function haptic(pattern: number | number[] = 10): void {
  if (typeof window === "undefined") return;
  const nav = window.navigator as Navigator & {
    vibrate?: (p: number | number[]) => boolean;
  };
  try {
    nav.vibrate?.(pattern);
  } catch {
    /* noop */
  }
}

export const tap = () => haptic(10);
export const thud = () => haptic([30, 60, 30]);
export const gavel = () => haptic([40, 30, 40, 30, 120]);
