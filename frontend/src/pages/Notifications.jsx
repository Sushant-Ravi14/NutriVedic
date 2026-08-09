import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { NotificationPanel } from '../components/features/notifications/NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';

export const Notifications = () => {
  const { data: notifications, markAsRead } = useNotifications();

  return (
    <PageWrapper>
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          SYSTEM ALERTS & MESSAGES
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">Notifications</h1>
      </div>

      <NotificationPanel notifications={notifications} onMarkRead={markAsRead} />
    </PageWrapper>
  );
};
