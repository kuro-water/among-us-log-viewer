import { type ChangeEvent } from "react";

interface Option {
  value: string;
  label: string;
}

interface CheckboxListProps {
  label: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function CheckboxList({
  label,
  options,
  selectedValues,
  onChange,
  className = "",
}: CheckboxListProps) {
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

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs text-slate-500 hover:text-indigo-600"
        >
          {selectedValues.length === options.length ? "全解除" : "全選択"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="space-y-1">
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
      <div className="mt-2 text-xs text-slate-400">
        選択中: {selectedValues.length} / {options.length}
      </div>
    </div>
  );
}
