import { type ChangeEvent } from "react";

import { MultiSelectDropdown } from "../ui/MultiSelectDropdown";

interface Option {
  value: string;
  label: string;
}

interface FilterSectionProps {
  selectedGameIds: string[];
  selectedPlayerIds: string[];
  gameOptions: Option[];
  playerOptions: Option[];
  onGameChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onPlayerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export function FilterSection({
  selectedGameIds,
  selectedPlayerIds,
  gameOptions,
  playerOptions,
  onGameChange,
  onPlayerChange,
}: FilterSectionProps) {
  // Adapter to convert string[] back to synthetic event for compatibility with existing hook
  const handleGameChange = (values: string[]) => {
    const mockOptions = values.map(v => ({ value: v, selected: true }));
    const syntheticEvent = {
      target: {
        selectedOptions: mockOptions,
        options: mockOptions,
        value: values[0]
      }
    } as unknown as ChangeEvent<HTMLSelectElement>;
    
    onGameChange(syntheticEvent);
  };

  const handlePlayerChange = (values: string[]) => {
     const mockOptions = values.map(v => ({ value: v, selected: true }));
    const syntheticEvent = {
      target: {
        selectedOptions: mockOptions,
        options: mockOptions,
        value: values[0]
      }
    } as unknown as ChangeEvent<HTMLSelectElement>;
    
    onPlayerChange(syntheticEvent);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Game Filter - MultiSelect Dropdown */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
            <span className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="font-bold tracking-tight">試合を選択</span>
          </div>
          <MultiSelectDropdown
            label="試合一覧"
            options={gameOptions}
            selectedValues={selectedGameIds}
            onChange={handleGameChange}
          />
          <p className="mt-2 text-xs text-slate-400">
            ドロップダウンを開いて選択します。
          </p>
        </div>

        {/* Player Filter - MultiSelect Dropdown */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2 text-slate-700">
             <span className="text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </span>
            <span className="font-bold tracking-tight">プレイヤーを選択</span>
          </div>
          <MultiSelectDropdown
            label="プレイヤー一覧"
            options={playerOptions}
            selectedValues={selectedPlayerIds}
            onChange={handlePlayerChange}
          />
          <p className="mt-2 text-xs text-slate-400">
            ドロップダウンを開いて選択します。
          </p>
        </div>
      </div>
    </section>
  );
}
