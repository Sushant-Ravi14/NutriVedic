import React from 'react';

export const Toggle = ({ checked = false, onChange, label, id, ariaLabel }) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-in-out focus:outline-none active:scale-95 ${
          checked ? 'bg-black' : 'bg-[#e0e0e0]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-md transition duration-300 ease-in-out ${
            checked ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className="font-sans text-[14px] text-black cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
};
