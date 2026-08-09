import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SettingsNav } from '../components/features/settings/SettingsNav';
import { PersonalInfoForm } from '../components/features/settings/PersonalInfoForm';
import { ConditionsEditor } from '../components/features/settings/ConditionsEditor';
import { PreferencesForm } from '../components/features/settings/PreferencesForm';
import { DangerZone } from '../components/features/settings/DangerZone';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { createSubscriptionOrderApi, verifySubscriptionApi } from '../api/subscription.api';

export const Settings = () => {
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('tab') || 'personal';

  const [activeSection, setActiveSection] = useState(initialSection);

  const { user, profile, updateUser, updateProfile } = useAuthStore();
  const { saveProfile } = useAuth();

  const handleSaveProfile = async (formData) => {
    const { firstName, lastName, email, age, weight, height } = formData;
    const numWeight = Number(weight) || 72;
    const numHeight = Number(height) || 175;
    const numAge = Number(age) || 28;

    // Calculate TDEE and Target Calories dynamically from updated biometrics
    const bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge + 5;
    const targetCalories = Math.round(bmr * 1.25);

    updateUser({ firstName, lastName, email });

    const updatedProfileData = {
      ...profile,
      age: numAge,
      weight: numWeight,
      height: numHeight,
      targetCalories
    };

    updateProfile(updatedProfileData);
    await saveProfile(updatedProfileData);
  };

  const handleSaveConditions = async (conditions) => {
    const updatedProfileData = { ...profile, conditions };
    updateProfile(updatedProfileData);
    await saveProfile(updatedProfileData);
  };

  const handleUpgradeSubscription = async () => {
    const order = await createSubscriptionOrderApi('premium');
    await verifySubscriptionApi({ orderId: order.orderId, paymentId: 'pay_demo_123' });
    updateUser({ subscriptionTier: 'premium' });
    alert('Upgraded to NutriVedic Premium successfully!');
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          USER CONFIGURATION & ACCOUNT
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">Settings</h1>
      </div>

      {/* Subscription Banner if Tab = subscription */}
      {activeSection === 'subscription' && (
        <Card className="mb-6 bg-black text-white p-6 rounded-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-label block">PREMIUM TIER REQUIRED</span>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">Unlock Unlimited AI Freshness Scans</h3>
            <p className="font-sans text-xs text-[#e0e0e0] mt-1 max-w-lg">
              Get access to personalized therapeutic diet plan generation, unlimited barcode scanning, and PDF reports export.
            </p>
          </div>
          <Button variant="secondary" onClick={handleUpgradeSubscription} className="bg-white text-black">
            Upgrade for ₹499 / mo
          </Button>
        </Card>
      )}

      {/* 2-Column Split */}
      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
        <SettingsNav activeSection={activeSection} onSelectSection={setActiveSection} />

        <div className="flex-1 w-full bg-white border border-border rounded-card p-6 md:p-8">
          {activeSection === 'personal' && (
            <PersonalInfoForm
              initialData={{ ...user, ...profile }}
              onSave={handleSaveProfile}
            />
          )}

          {activeSection === 'conditions' && (
            <ConditionsEditor
              initialConditions={profile?.conditions || []}
              onSave={handleSaveConditions}
            />
          )}

          {activeSection === 'preferences' && <PreferencesForm />}

          {(activeSection === 'account' || activeSection === 'subscription') && (
            <div className="flex flex-col gap-8">
              <Card className="flex items-center justify-between p-4 bg-surface">
                <div>
                  <span className="font-mono text-[10px] text-label uppercase">SUBSCRIPTION TIER</span>
                  <h4 className="font-serif text-lg font-bold text-black capitalize">
                    {user?.subscriptionTier || 'Free Plan'}
                  </h4>
                </div>
                <Button variant="secondary" size="sm" onClick={handleUpgradeSubscription}>
                  Manage Plan
                </Button>
              </Card>

              <DangerZone />
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
