import React from 'react';

export const SettingsNav = ({ activeSection, onSelectSection }) => {
  const sections = [
    { id: 'personal', label: 'Personal Info', svgType: 'personal' },
    { id: 'conditions', label: 'Health Conditions', svgType: 'conditions' },
    { id: 'preferences', label: 'Preferences', svgType: 'preferences' },
    { id: 'account', label: 'Account & Security', svgType: 'account' }
  ];

  const renderIcon = (type, fill) => {
    switch (type) {
      case 'personal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className="shrink-0">
            <path d="M367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm0 400Z" />
          </svg>
        );
      case 'conditions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className="shrink-0">
            <path d="M300-840q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 5-.5 10t-.5 10h-80q1-5 1-10v-10q0-60-40-100t-100-40q-47 0-87 26.5T518-666h-76q-15-41-55-67.5T300-760q-60 0-100 40t-40 100v10q0 5 1 10H81q0-5-.5-10t-.5-10q0-94 63-157t157-63Zm-88 480h112q32 31 70 67t86 79q48-43 86-79t70-67h113q-38 42-90 91T538-158l-58 52-58-52q-69-62-120.5-111T212-360Zm230 40q13 0 22.5-7.5T478-347l54-163 35 52q5 8 14 13t19 5h320v-80H623l-69-102q-6-9-15.5-13.5T518-640q-13 0-22.5 7.5T482-613l-54 162-34-51q-5-8-14-13t-19-5H40v80h297l69 102q6 9 15.5 13.5T442-320Zm38-167Z" />
          </svg>
        );
      case 'preferences':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className="shrink-0">
            <path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        );
      case 'account':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className="shrink-0">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="flex flex-col gap-1 w-full md:w-[200px] shrink-0 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
      {sections.map((sec) => {
        const isActive = activeSection === sec.id;
        const fill = isActive ? '#ffffff' : '#6b6b6b';

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection && onSelectSection(sec.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-sans font-medium transition-colors text-left ${
              isActive
                ? 'bg-black text-white'
                : 'text-muted hover:text-black hover:bg-surface'
            }`}
          >
            {renderIcon(sec.svgType, fill)}
            <span>{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
