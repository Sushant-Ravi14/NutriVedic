import React from 'react';

export const NotificationItem = ({ notification, onMarkRead }) => {
  return (
    <div
      onClick={() => onMarkRead && onMarkRead(notification.id)}
      className={`p-4 border-b border-border hover:bg-surface transition-colors cursor-pointer flex items-start gap-3 ${
        notification.unread ? 'bg-surface/50' : 'bg-white'
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-black mt-2 shrink-0 opacity-80" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-sans font-semibold text-sm text-black">{notification.title}</h4>
          <span className="font-mono text-[10px] text-muted">{notification.time}</span>
        </div>
        <p className="font-sans text-xs text-muted mt-1 leading-relaxed">{notification.message}</p>
      </div>
    </div>
  );
};
