import { type ChangeEvent } from "react";

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

function SelectLabel({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span className="font-semibold text-slate-800">{label}</span>
      {helper ? <span>{helper}</span> : null}
    </div>
  );
}

export function FilterSection({
  selectedGameIds,
  selectedPlayerIds,
  gameOptions,
  playerOptions,
  onGameChange,
  onPlayerChange,
}: FilterSectionProps) {
  const gameSelectSize = Math.min(Math.max(gameOptions.length, 3), 8);
  const playerSelectSize = Math.min(Math.max(playerOptions.length, 6), 10);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SelectLabel
            label="試合選択"
            helper={`${selectedGameIds.length || "すべて"} 件`}
          />
          <select
            multiple
            value={selectedGameIds}
            onChange={onGameChange}
            size={gameSelectSize}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner"
          >
            {gameOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            複数選択で試合を絞り込みます（Ctrl / Command + クリック）。
          </p>
        </div>
        <div>
          <SelectLabel
            label="プレイヤー選択"
            helper={`${selectedPlayerIds.length || "すべて"} 名`}
          />
          <select
            multiple
            value={selectedPlayerIds}
            onChange={onPlayerChange}
            size={playerSelectSize}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner"
          >
            {playerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            プレイヤー軸のチャート（ヒートマップ/レーダーなど）に適用されます。
          </p>
        </div>
      </div>
    </section>
  );
}
