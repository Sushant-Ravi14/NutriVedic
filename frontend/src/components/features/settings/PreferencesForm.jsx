import React from 'react';
import { Card } from '../../ui/Card';
import { Toggle } from '../../ui/Toggle';
import { useUIStore } from '../../../store/uiStore';

export const PreferencesForm = () => {
  const preferences = useUIStore((state) => state.preferences);
  const updatePreference = useUIStore((state) => state.updatePreference);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-black font-bold mb-1">App Preferences</h3>
        <p className="font-sans text-xs text-muted">Configure notification triggers and interface settings.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <h4 className="font-sans font-semibold text-sm text-black">Push Notifications</h4>
            <p className="font-sans text-xs text-muted">Daily water & meal logging reminders</p>
          </div>
          <Toggle
            checked={preferences.notifications}
            onChange={(val) => updatePreference('notifications', val)}
            ariaLabel="Push Notifications"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <h4 className="font-sans font-semibold text-sm text-black">Weekly Email Report</h4>
            <p className="font-sans text-xs text-muted">Summary of diet compliance & analytics</p>
          </div>
          <Toggle
            checked={preferences.weeklyReportEmail}
            onChange={(val) => updatePreference('weeklyReportEmail', val)}
            ariaLabel="Weekly Email Report"
          />
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <h4 className="font-sans font-semibold text-sm text-black">Use Metric Units (kg / cm)</h4>
            <p className="font-sans text-xs text-muted">Standard metric weight and height units</p>
          </div>
          <Toggle
            checked={preferences.metricUnits}
            onChange={(val) => updatePreference('metricUnits', val)}
            ariaLabel="Use Metric Units"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="font-sans font-semibold text-sm text-black">Monochrome High-Contrast Theme</h4>
            <p className="font-sans text-xs text-muted">Optimized for high-contrast accessibility</p>
          </div>
          <Toggle
            checked={preferences.darkMode}
            onChange={(val) => updatePreference('darkMode', val)}
            ariaLabel="High Contrast Theme"
          />
        </div>
      </Card>
    </div>
  );
};
