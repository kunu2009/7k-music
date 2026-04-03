export type AndroidAbi = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64';

export interface AndroidApkOption {
  abi: AndroidAbi;
  label: string;
  description: string;
  sizeLabel: string;
  href: string;
}

export const ANDROID_RELEASE_META = {
  versionLabel: 'v1.0.0+1',
  buildLabel: 'Build 2026.04.04',
  notes: 'Split APK release for smaller per-device installs.',
};

export const ANDROID_APK_OPTIONS: AndroidApkOption[] = [
  {
    abi: 'arm64-v8a',
    label: 'ARM64 (Most phones)',
    description: 'Best for newer Android phones and tablets (64-bit ARM).',
    sizeLabel: '17.8 MB',
    href: '/apk/7k-music-arm64-v8a.apk',
  },
  {
    abi: 'armeabi-v7a',
    label: 'ARMv7 (Older phones)',
    description: 'For older 32-bit ARM Android phones.',
    sizeLabel: '15.4 MB',
    href: '/apk/7k-music-armeabi-v7a.apk',
  },
  {
    abi: 'x86_64',
    label: 'x86_64 (Emulators/rare devices)',
    description: 'Mainly for Android emulators and uncommon x86 devices.',
    sizeLabel: '18.9 MB',
    href: '/apk/7k-music-x86_64.apk',
  },
];

export function detectPreferredAndroidAbi(userAgent: string): AndroidAbi {
  const ua = userAgent.toLowerCase();

  if (ua.includes('x86_64') || ua.includes('amd64') || ua.includes('win64') || ua.includes('x64')) {
    return 'x86_64';
  }

  if (ua.includes('armv7') || ua.includes('armeabi') || ua.includes('arm;')) {
    return 'armeabi-v7a';
  }

  return 'arm64-v8a';
}
