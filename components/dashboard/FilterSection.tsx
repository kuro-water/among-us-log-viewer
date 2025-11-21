import { type ChangeEvent, useState, useMemo } from "react";

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
  recentGamesCount: number | null;
  onGameChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onPlayerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onRecentGamesChange: (count: number | null) => void;
  resetFilters: () => void;
}

type FilterMode = "all" | "recent" | "manual";

export function FilterSection({
  selectedGameIds,
  selectedPlayerIds,
  gameOptions,
  playerOptions,
  recentGamesCount,
  onGameChange,
  onPlayerChange,
  onRecentGamesChange,
  resetFilters,
}: FilterSectionProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // カスタム入力状態（「カスタム」選択で数値入力フィールドを表示するため）
  // - `isCustomRecent` は外部の `recentGamesCount` がプリセット以外の値かどうかを
  //   派生（derived）して判定します。副作用で setState を呼ばないことで
  //   `react-hooks/set-state-in-effect` ルールに違反しないようにします。
  const [isCustomRecentLocal, setIsCustomRecentLocal] = useState<boolean>(false);
  const [customRecentValue, setCustomRecentValue] = useState<string>("");

  // recentGamesCount の外部変更と同期（プリセット以外はカスタム扱い）
  // 外部から recentGamesCount に値が入ったとき、カスタムの選択肢であればその
  // 値を入力欄のデフォルト表示に使います。ここでは副作用で state を更新せず
  // 派生値で判定するため、直接 input の value 側で fallback を利用します。
  const isCustomRecentDerived =
    recentGamesCount !== null && ![5, 10, 20, 50].includes(recentGamesCount);

  // 外部の値（recentGamesCount）がカスタムであれば UI はカスタム表示となるよう
  // に local フラグと OR を取り合わせた表示フラグを使う。
  const isCustomRecent = isCustomRecentLocal || isCustomRecentDerived;

  // `filterMode` はユーザー操作で変更するため state を残しますが、外部の
  // `selectedGameIds` や `recentGamesCount` が指定されているときは UI 側で
  // 上位の優先度（manual > recent > state）で表示するため、派生変数
  // `effectiveFilterMode` を導出します。これにより副作用で setState を
  // 呼ばずに外部と UI の整合性を取ります。
  const effectiveFilterMode = useMemo<FilterMode>(() => {
    if (selectedGameIds.length > 0) return "manual";
    if (recentGamesCount !== null) return "recent";
    return filterMode;
  }, [selectedGameIds.length, recentGamesCount, filterMode]);

  // Adapter to convert string[] back to synthetic event for compatibility with existing hook
  const handleGameChange = (values: string[]) => {
    const mockOptions = values.map((v) => ({ value: v, selected: true }));
    const syntheticEvent = {
      target: {
        selectedOptions: mockOptions,
        options: mockOptions,
        value: values[0],
      },
    } as unknown as ChangeEvent<HTMLSelectElement>;

    onGameChange(syntheticEvent);
  };

  const handlePlayerChange = (values: string[]) => {
    const mockOptions = values.map((v) => ({ value: v, selected: true }));
    const syntheticEvent = {
      target: {
        selectedOptions: mockOptions,
        options: mockOptions,
        value: values[0],
      },
    } as unknown as ChangeEvent<HTMLSelectElement>;

    onPlayerChange(syntheticEvent);
  };

  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    if (mode === "all") {
      // 全期間: 両方クリア
      handleGameChange([]);
      onRecentGamesChange(null);
    } else if (mode === "recent") {
      // 直近: 個別選択をクリアし、デフォルト値（5試合）を設定
      handleGameChange([]);
      if (recentGamesCount === null) {
        onRecentGamesChange(5);
      }
    } else if (mode === "manual") {
      // 個別選択: 直近設定をクリア
      onRecentGamesChange(null);
    }
  };

  const handleReset = () => {
    resetFilters();
    setFilterMode("all");
    setIsCustomRecentLocal(false);
    setCustomRecentValue("");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Game Filter Section */}
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
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-2 0v1H7V3a1 1 0 00-1-1zM4 9h12v5H4V9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="font-bold tracking-tight">試合の絞り込み</span>
          </div>

          {/* Mode Selection Tabs */}
          <div className="mb-4 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => handleModeChange("all")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                effectiveFilterMode === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              全期間
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("recent")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                effectiveFilterMode === "recent"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              直近の試合
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("manual")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                effectiveFilterMode === "manual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              個別に選択
            </button>
          </div>

          {/* Recent Games Controls */}
          {effectiveFilterMode === "recent" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex gap-3">
                <select
                  value={
                    isCustomRecent ||
                    (recentGamesCount !== null &&
                      ![5, 10, 20, 50].includes(recentGamesCount))
                      ? "custom"
                      : recentGamesCount !== null
                      ? String(recentGamesCount)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "custom") {
                      setIsCustomRecentLocal(true);
                      setCustomRecentValue("");
                      setTimeout(() => {
                        const input = document.getElementById(
                          "custom-recent-games"
                        );
                        input?.focus();
                      }, 0);
                    } else if (value === "") {
                      setIsCustomRecentLocal(false);
                      onRecentGamesChange(null);
                    } else {
                      setIsCustomRecentLocal(false);
                      const num = parseInt(value, 10);
                      if (!Number.isNaN(num)) onRecentGamesChange(num);
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">指定なし</option>
                  <option value="5">直近 5 試合</option>
                  <option value="10">直近 10 試合</option>
                  <option value="20">直近 20 試合</option>
                  <option value="50">直近 50 試合</option>
                  <option value="custom">カスタム</option>
                </select>
                {isCustomRecent && (
                  <input
                    id="custom-recent-games"
                    type="number"
                    min="1"
                    // `customRecentValue` はユーザーの編集中の値を保持します。
                    // ただし外部から recentGamesCount がカスタム値で与えられた場合は
                    // その値を表示する（入力中の fallback）。
                    value={
                      customRecentValue ||
                      (isCustomRecentDerived && String(recentGamesCount)) ||
                      ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomRecentValue(value);
                      if (value) {
                        const num = parseInt(value, 10);
                        if (num > 0) onRecentGamesChange(num);
                      } else {
                        onRecentGamesChange(null);
                      }
                    }}
                    placeholder="数値を入力"
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {isCustomRecent ||
                (recentGamesCount !== null &&
                  ![5, 10, 20, 50].includes(recentGamesCount))
                  ? `最新 ${
                      customRecentValue || recentGamesCount
                    } 試合のデータが表示されます`
                  : recentGamesCount
                  ? `最新 ${recentGamesCount} 試合のデータが表示されます`
                  : "試合数を選択してください"}
              </p>
            </div>
          )}

          {/* Manual Selection Controls */}
          {effectiveFilterMode === "manual" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
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
          )}

          {/* All Games Message */}
          {effectiveFilterMode === "all" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center text-sm text-slate-500">
                すべての試合データが表示されます
              </div>
            </div>
          )}
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

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-transparent bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          フィルタをクリア
        </button>
      </div>
    </section>
  );
}
