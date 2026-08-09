import React from 'react';
import { NotificationItem } from './NotificationItem';
import { EmptyState } from '../../ui/EmptyState';

export const NotificationPanel = ({ notifications = [], onMarkRead }) => {
  if (!notifications || notifications.length === 0) {
    return <EmptyState message="You have no new notifications." />;
  }

  return (
    <div className="w-full border border-border rounded-card overflow-hidden bg-white">
      {notifications.map((item) => (
        <NotificationItem key={item.id} notification={item} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
};
