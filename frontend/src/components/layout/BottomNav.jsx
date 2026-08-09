import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { renderNavIcon } from './Sidebar';

export const BottomNav = () => {
  const location = useLocation();

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', svgType: 'dashboard' },
    { label: 'Scan', path: '/scan', svgType: 'camera' },
    { label: 'Log', path: '/food-log', svgType: 'food' },
    { label: 'Plan', path: '/diet-plan', svgType: 'diet' },
    { label: 'Profile', path: '/settings', svgType: 'settings' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border h-[60px] pb-[env(safe-area-inset-bottom)] flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const fill = isActive ? '#0a0a0a' : '#9e9e9e';

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
              isActive ? 'text-black' : 'text-label'
            }`}
          >
            {renderNavIcon(tab.svgType, fill, 'w-5 h-5')}
            <span className="font-sans text-[10px] font-medium leading-none">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
