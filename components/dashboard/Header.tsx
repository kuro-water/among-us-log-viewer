import { type MouseEventHandler } from "react";

interface HeaderProps {
  loading: boolean;
  refresh: MouseEventHandler<HTMLButtonElement>;
  resetFilters: MouseEventHandler<HTMLButtonElement>;
}

export function Header({ loading, refresh, resetFilters }: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Among Us Analytics
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Beyond Us ライトテーマダッシュボード
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          JSONL
          ログをブラウザだけで読み込み、役職別パフォーマンスやヒートマップ、移動タイムラインなど
          10 種類の Highcharts を一括で確認できます。
        </p>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {loading ? (
          <span className="rounded-full bg-slate-200 px-4 py-2 font-medium text-slate-600">
            読み込み中...
          </span>
        ) : null}
        <button
          type="button"
          onClick={refresh}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition hover:border-slate-400"
        >
          データ再取得
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-transparent bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          フィルタをクリア
        </button>
      </div>
    </header>
  );
}
