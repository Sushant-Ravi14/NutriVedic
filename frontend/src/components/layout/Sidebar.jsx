import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';

export const renderNavIcon = (svgType, fill = 'currentColor', className = 'shrink-0') => {
  switch (svgType) {
    case 'dashboard':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="M280-280h80v-280h-80v280Zm160 0h80v-400h-80v400Zm160 0h80v-160h-80v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
        </svg>
      );
    case 'camera':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" />
        </svg>
      );
    case 'food':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="M640-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170T640-80Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm-480 0q-33 0-56.5-23.5T80-240v-304q0-8 1.5-16t4.5-16l80-184h-6q-17 0-28.5-11.5T120-800v-40q0-17 11.5-28.5T160-880h280q17 0 28.5 11.5T480-840v40q0 17-11.5 28.5T440-760h-6l66 152q-19 10-36 21t-32 25l-84-198h-96l-92 216v304h170q5 21 13.5 41.5T364-160H160Zm480-440q-42 0-71-29t-29-71q0-42 29-71t71-29v200q0-42 29-71t71-29q42 0 71 29t29 71H640Z" />
        </svg>
      );
    case 'diet':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="m280-120-61-184q-36-20-61-53t-36-75L80-600h800l-42 168q-11 42-36 75t-61 53l-61 184H280Zm58-80h284l27-80H311l27 80Zm-22-160h328q42 0 74-25.5t42-65.5l18-69H182l18 69q10 40 42 65.5t74 25.5Zm484-240h-80v-50q0-21-14-35.5T672-700q-11 0-22 5t-20 15H507l-10-36q-5-20-21-32t-36-12q-18 0-32.5 9.5T385-724l-19 44h-86q-17 0-28.5 11.5T240-640v40h-80v-40q0-50 34.5-85t83.5-35q8 0 17 1.5t17 3.5q17-38 51.5-61.5T440-840q48 0 84.5 28.5T574-737q19-20 44-31.5t53-11.5q54 0 91.5 38t37.5 92v50Zm-320 80ZM338-200h284-284Z" />
        </svg>
      );
    case 'reports':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm221.5-198.5Q510-807 510-820t-8.5-21.5Q493-850 480-850t-21.5 8.5Q450-833 450-820t8.5 21.5Q467-790 480-790t21.5-8.5ZM200-200v-560 560Z" />
        </svg>
      );
    case 'notifications':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
        </svg>
      );
    case 'settings':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill={fill} className={className}>
          <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
        </svg>
      );
    default:
      return null;
  }
};

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const location = useLocation();
  const navigate = useNavigate();
  const setActiveNav = useUIStore((state) => state.setActiveNav);
  const addToast = useUIStore((state) => state.addToast);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      addToast('Logged out', 'info');
      navigate('/login');
    }
  };

  const getInitials = () => {
    if (!user) return 'NV';
    const f = user.firstName ? user.firstName[0] : '';
    const l = user.lastName ? user.lastName[0] : '';
    return (f + l).toUpperCase() || 'NV';
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', svgType: 'dashboard' },
    { label: 'Scanner', path: '/scan', svgType: 'camera' },
    { label: 'Food Log', path: '/food-log', svgType: 'food' },
    { label: 'Diet Plan', path: '/diet-plan', svgType: 'diet' },
    { label: 'Reports', path: '/reports', svgType: 'reports' },
    { label: 'Notifications', path: '/notifications', svgType: 'notifications' },
    { label: 'Settings', path: '/settings', svgType: 'settings' }
  ];

  return (
    <aside className="hidden md:flex flex-col w-[48px] lg:w-[220px] shrink-0 border-r border-border bg-white min-h-screen sticky top-0 h-screen transition-all duration-200 select-none">
      {/* Brand Header */}
      <div className="p-4 lg:p-6 border-b border-border flex items-center gap-2">
        <span className="font-serif text-xl font-bold tracking-tight text-black flex items-center gap-1">
          Nutri<span className="italic text-muted font-normal">Vedic</span>
        </span>
      </div>

      {/* User Info Header */}
      <div className="p-3 lg:p-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-medium shrink-0">
          {getInitials()}
        </div>
        <div className="hidden lg:flex flex-col truncate">
          <span className="font-sans text-[14px] font-medium text-black truncate">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
          </span>
          <span className="font-mono text-[11px] text-muted truncate">
            {profile?.targetCalories ? `${profile.targetCalories} kcal` : '2,000 kcal'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 lg:p-3 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const fill = isActive ? '#ffffff' : '#6b6b6b';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setActiveNav(item.label.toLowerCase())}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs lg:text-[14px] font-sans font-medium transition-colors ${
                isActive
                  ? 'bg-black text-white rounded-pill'
                  : 'text-muted hover:text-black hover:bg-surface'
              }`}
            >
              {renderNavIcon(item.svgType, fill)}
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout + Version Footer */}
      <div className="p-3 border-t border-border flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs lg:text-[14px] font-sans font-medium text-muted hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" viewBox="0 -960 960 960" fill="currentColor" className="shrink-0">
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
          </svg>
          <span className="hidden lg:inline">Logout</span>
        </button>
        <span className="font-mono text-[10px] uppercase text-label tracking-widest hidden lg:block pl-3">
          NutriVedic v1.0
        </span>
      </div>
    </aside>
  );
};
