import React, { useEffect, useState } from 'react';
import { Settings, Gauge, Wifi, Save } from 'lucide-react';

type Quality = 'auto' | 'small' | 'medium' | 'large' | 'hd720';

const QUALITY_OPTIONS: Array<{ value: Quality; label: string; description: string }> = [
  { value: 'auto', label: 'Auto', description: 'Uses YouTube default quality behavior.' },
  { value: 'small', label: '144p (Data Saver)', description: 'Lowest video quality for minimum data use.' },
  { value: 'medium', label: '360p', description: 'Balanced quality with low-to-medium data usage.' },
  { value: 'large', label: '480p', description: 'Standard quality and moderate data usage.' },
  { value: 'hd720', label: '720p', description: 'Higher quality and higher data usage.' },
];

export const SettingsPage: React.FC = () => {
  const [quality, setQuality] = useState<Quality>('auto');
  const [dataSaver, setDataSaver] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedQuality = (localStorage.getItem('player.videoQuality') as Quality | null) || 'auto';
    const storedDataSaver = localStorage.getItem('player.dataSaver') === 'true';
    setQuality(storedQuality);
    setDataSaver(storedDataSaver);
  }, []);

  const onSave = () => {
    localStorage.setItem('player.videoQuality', quality);
    localStorage.setItem('player.dataSaver', dataSaver ? 'true' : 'false');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="app-page">
      <div className="container mx-auto px-4 space-y-6">
        <div className="glass-surface rounded-3xl p-6 md:p-8 border border-blue-200/15">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-7 h-7 text-blue-200" />
            <h2 className="text-3xl font-bold text-white">Playback Settings</h2>
          </div>
          <p className="text-blue-100/75 max-w-3xl">
            Reduce video quality to save data while streaming. Since this app is audio-first, lower quality can cut bandwidth significantly.
          </p>
        </div>

        <div className="glass-surface rounded-2xl border border-blue-200/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-5 h-5 text-blue-200" />
            <h3 className="text-white font-semibold">Preferred Video Quality</h3>
          </div>

          <div className="space-y-3">
            {QUALITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`block rounded-xl border p-4 cursor-pointer transition ${
                  quality === option.value
                    ? 'border-blue-300/70 bg-blue-500/20'
                    : 'border-blue-200/20 bg-blue-500/5 hover:bg-blue-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="quality"
                    value={option.value}
                    checked={quality === option.value}
                    onChange={() => setQuality(option.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-white font-medium">{option.label}</p>
                    <p className="text-blue-100/70 text-sm">{option.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="glass-surface rounded-2xl border border-blue-200/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-5 h-5 text-blue-200" />
            <h3 className="text-white font-semibold">Data Saver</h3>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-blue-200/20 bg-blue-500/5 px-4 py-3">
            <div>
              <p className="text-white font-medium">Enable Data Saver</p>
              <p className="text-blue-100/70 text-sm">Forces very low quality when quality is set to Auto.</p>
            </div>
            <input
              type="checkbox"
              checked={dataSaver}
              onChange={(e) => setDataSaver(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="pill-action px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
          {saved && <span className="text-emerald-300 text-sm">Saved.</span>}
        </div>
      </div>
    </div>
  );
};
