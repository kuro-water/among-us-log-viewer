"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  className = "",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return "選択なし";
    if (selectedValues.length === options.length) return "すべて選択中";

    // Show labels if 3 or fewer items are selected
    if (selectedValues.length <= 3) {
      const selectedLabels = options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.label);
      return selectedLabels.join(", ");
    }

    return `${selectedValues.length} 件選択中`;
  };

  const displayValue = getDisplayValue();

  return (
    <div className={`flex flex-col ${className}`} ref={containerRef}>
      <span className="mb-2 text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-sm shadow-sm transition-all ${
            isOpen
              ? "border-indigo-500 ring-2 ring-indigo-100"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <span
            className={
              selectedValues.length === 0 ? "text-slate-400" : "text-slate-700"
            }
          >
            {displayValue}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5">
            <div className="mb-2 flex justify-end px-2">
              <button
                type="button"
                onClick={handleSelectAll}
                aria-pressed={selectedValues.length === options.length}
                className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {selectedValues.length === options.length ? "全解除" : "全選択"}
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedValues.includes(option.value)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
