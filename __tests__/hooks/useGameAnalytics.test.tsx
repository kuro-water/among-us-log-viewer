import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useGameAnalytics } from "@/hooks/useGameAnalytics";
import fs from "fs";

// Small test harness which renders the hook and exposes a JSON output
function HookHarness() {
  const s = useGameAnalytics();
  return (
    <div data-testid="out">
      {JSON.stringify({
        loading: s.loading,
        games: s.games.length,
        error: s.error?.message,
      })}
    </div>
  );
}

describe("useGameAnalytics load fallback", () => {
  const samplePath = `${process.cwd()}/public/game_history_sample.jsonl`;
  const sampleContent = fs.readFileSync(samplePath, "utf8");

  beforeEach(() => {
    // Reset any previous mocks
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("falls back to bundled sample when primary game_history.jsonl is missing", async () => {
    // Primary: missing (404)
    (global as any).fetch = jest.fn((input: RequestInfo) => {
      const url = String(input);
      // match both absolute and relative forms
      if (url.endsWith("game_history.jsonl")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
        });
      }

      // Fallback: sample file
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(sampleContent),
      });
    });

    render(<HookHarness />);

    // Wait for the hook to finish and load the fallback sample (5 games)
    await waitFor(() =>
      expect(screen.getByTestId("out").textContent).toContain('"games":5')
    );
  });
});
