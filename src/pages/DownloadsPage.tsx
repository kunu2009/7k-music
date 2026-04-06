import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Cpu, Download, ShieldCheck, Smartphone } from 'lucide-react';
import {
  ANDROID_APK_OPTIONS,
  ANDROID_RELEASE_META,
  AndroidAbi,
  detectPreferredAndroidAbi,
} from '@/utils/androidDownloads';

export const DownloadsPage: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  const recommendedAbi = useMemo<AndroidAbi>(() => {
    if (typeof navigator === 'undefined') {
      return 'arm64-v8a';
    }
    return detectPreferredAndroidAbi(navigator.userAgent || '');
  }, []);

  const recommendedApk = useMemo(
    () => ANDROID_APK_OPTIONS.find((option) => option.abi === recommendedAbi) || ANDROID_APK_OPTIONS[0],
    [recommendedAbi]
  );

  return (
    <div className="app-page">
      <div className="container mx-auto px-4 space-y-6">
        <div className="glass-surface rounded-3xl p-6 md:p-8 border border-blue-200/15">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-7 h-7 text-blue-200" />
                <h2 className="text-3xl font-bold text-white">Android Downloads</h2>
              </div>
              <p className="text-blue-100/75 max-w-2xl">
                Download the APK matched to your device architecture for lower size and faster install.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelp((prev) => !prev)}
                className="px-4 py-2 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition inline-flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Which architecture am I?
              </button>
              <Link
                to="/"
                className="px-4 py-2 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back Home
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200/20 bg-blue-500/10 p-4 md:p-5">
            <p className="text-blue-100/90 text-sm">
              Recommended for this device: <span className="text-white font-semibold">{recommendedApk.label}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-blue-100/80">
              <span className="px-2.5 py-1 rounded-full border border-blue-200/25">{ANDROID_RELEASE_META.versionLabel}</span>
              <span className="px-2.5 py-1 rounded-full border border-blue-200/25">{ANDROID_RELEASE_META.buildLabel}</span>
              <span className="px-2.5 py-1 rounded-full border border-blue-200/25">{ANDROID_RELEASE_META.notes}</span>
            </div>
            <a
              href={recommendedApk.href}
              download
              className="pill-action mt-4 px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Recommended APK
            </a>
          </div>
        </div>

        {showHelp && (
          <div className="glass-surface rounded-2xl border border-blue-200/20 p-5">
            <h3 className="text-white font-semibold mb-3">How to choose your APK architecture</h3>
            <div className="space-y-2 text-sm text-blue-100/80">
              <p>Most modern phones: use ARM64.</p>
              <p>Very old Android phones: use ARMv7.</p>
              <p>Android emulators on desktop: usually x86_64.</p>
              <p>
                On Android, you can install an app like Device Info HW to check CPU ABI if you are unsure.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ANDROID_APK_OPTIONS.map((option) => {
            const isRecommended = option.abi === recommendedAbi;
            return (
              <div
                key={option.abi}
                className={`glass-surface rounded-2xl border p-5 ${
                  isRecommended
                    ? 'border-blue-200/70 bg-blue-500/20'
                    : 'border-blue-200/20 bg-blue-500/5'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-white font-semibold text-sm">{option.label}</p>
                  {isRecommended && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-slate-900 font-bold">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="text-blue-100/75 text-xs mb-3">{option.description}</p>

                <div className="flex items-center justify-between gap-2 text-xs mb-4">
                  <span className="text-blue-100/85 inline-flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    {option.abi}
                  </span>
                  <span className="text-blue-100/90">{option.sizeLabel}</span>
                </div>

                <a
                  href={option.href}
                  download
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200/30 px-3 py-2 text-xs text-blue-100/90 hover:bg-blue-500/20 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download APK
                </a>
              </div>
            );
          })}
        </div>

        <div className="glass-surface rounded-2xl border border-blue-200/20 p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            Install Notes
          </h3>
          <p className="text-blue-100/80 text-sm">
            If Android blocks installation, enable Install unknown apps in system settings for your browser/files app,
            then open the APK again.
          </p>
        </div>

        <section className="glass-surface rounded-2xl border border-blue-200/20 p-5 md:p-6 space-y-4">
          <h3 className="text-white text-xl font-semibold">Download 7K Music APK Safely</h3>
          <p className="text-blue-100/80 text-sm leading-7">
            This page provides official 7K Music Android APK files for multiple CPU architectures so you can install the
            app on modern phones, older devices, and emulators. If you are not sure which package to use, choose the
            recommended APK shown at the top of the page. It is selected automatically from your device user agent and
            is usually the best fit for performance and compatibility.
          </p>
          <p className="text-blue-100/80 text-sm leading-7">
            7K Music helps you discover and stream music videos with a fast, app-like interface. For the best install
            experience, always download from this official domain and keep your app updated to the latest build listed
            above. If installation fails, verify available storage, Android version support, and architecture match.
          </p>
        </section>

        <section className="glass-surface rounded-2xl border border-blue-200/20 p-5 md:p-6 space-y-4">
          <h3 className="text-white text-xl font-semibold">APK Download FAQ</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-1">Which APK should I install?</h4>
              <p className="text-blue-100/80">
                Install the recommended APK shown at the top. Most new Android phones use arm64-v8a.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Is 7K Music free to download?</h4>
              <p className="text-blue-100/80">Yes. The APK downloads listed here are free.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Why does Android block APK installation?</h4>
              <p className="text-blue-100/80">
                Android may require permission to install unknown apps. Enable that setting for your browser or file
                manager, then run the APK again.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">What if the app does not install?</h4>
              <p className="text-blue-100/80">
                Recheck architecture match, available storage, and Android version. Try another ABI build if needed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
