import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  label,
  id,
  options = [],
  value,
  onChange,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  // Find currently selected option label
  const selectedOption = options.find(opt => 
    (typeof opt === 'string' ? opt : opt.value) === value
  );
  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : 'Select option';

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          {label} {required && <span className="text-negative">*</span>}
        </span>
      )}
      
      {/* Dropdown Toggle Button */}
      <button
        id={selectId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-[42px] px-3.5 bg-white border border-border rounded-lg text-black font-sans text-[14px] flex items-center justify-between transition-all focus:outline-none focus:border-black cursor-pointer text-left ${
          isOpen ? 'border-black ring-1 ring-black' : ''
        } ${className}`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Custom Options Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-border rounded-lg shadow-lg z-50 py-1.5 max-h-[220px] overflow-y-auto font-sans text-[14px] text-black">
          {options.map((opt) => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const isSelected = optVal === value;

            return (
              <button
                key={optVal}
                type="button"
                onClick={() => handleSelect(optVal)}
                className={`w-full px-3.5 py-2.5 text-left transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? 'bg-black text-white font-medium' 
                    : 'hover:bg-surface text-black'
                }`}
              >
                <span>{optLabel}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

