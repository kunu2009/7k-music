export type HapticIntensity = 'light' | 'medium';

export function triggerHaptic(intensity: HapticIntensity = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const pattern = intensity === 'medium' ? 18 : 10;
  navigator.vibrate(pattern);
}
