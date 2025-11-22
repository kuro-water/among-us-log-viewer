import type { GameLog } from "../types/game-data.types";

export interface JsonLineError {
  lineNumber: number;
  line: string;
  error: Error;
}

export interface JsonlParseResult {
  games: GameLog[];
  errors: JsonLineError[];
}

export interface FetchJsonlOptions {
  signal?: AbortSignal;
  onProgress?: (loadedBytes: number) => void;
  /**
   * Optional override path. Defaults to `game_history_sample.jsonl` (relative) which is bundled under the public directory.
   */
  path?: string;
}

// Use a relative path so the request is resolved relative to the app's basePath
// (e.g., when the app is exported with next.config.basePath set for GitHub Pages).
const DEFAULT_SOURCE = "game_history_sample.jsonl";

const NEWLINE_PATTERN = /\r?\n/;

function parseLine(
  line: string,
  lineNumber: number,
  errors: JsonLineError[]
): GameLog | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as GameLog;
  } catch (error) {
    const parseError =
      error instanceof Error ? error : new Error(String(error));
    errors.push({ lineNumber, line: trimmed, error: parseError });
    return null;
  }
}

export function parseJsonlString(text: string): JsonlParseResult {
  const games: GameLog[] = [];
  const errors: JsonLineError[] = [];

  const lines = text.split(NEWLINE_PATTERN);
  lines.forEach((line, index) => {
    const parsed = parseLine(line, index + 1, errors);
    if (parsed) {
      games.push(parsed);
    }
  });

  return { games, errors };
}

async function parseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onProgress?: (loadedBytes: number) => void
): Promise<JsonlParseResult> {
  const games: GameLog[] = [];
  const errors: JsonLineError[] = [];
  const decoder = new TextDecoder();

  let buffer = "";
  let lineNumber = 0;
  let bytesRead = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    if (value) {
      bytesRead += value.byteLength;
      onProgress?.(bytesRead);
      buffer += decoder.decode(value, { stream: true });
      const segments = buffer.split(NEWLINE_PATTERN);
      buffer = segments.pop() ?? "";
      for (const segment of segments) {
        lineNumber += 1;
        const parsed = parseLine(segment, lineNumber, errors);
        if (parsed) {
          games.push(parsed);
        }
      }
    }
  }

  if (buffer.trim()) {
    lineNumber += 1;
    const parsed = parseLine(buffer, lineNumber, errors);
    if (parsed) {
      games.push(parsed);
    }
  }

  return { games, errors };
}

export async function loadGameHistory(
  options: FetchJsonlOptions = {}
): Promise<JsonlParseResult> {
  const { path = DEFAULT_SOURCE, signal, onProgress } = options;
  const response = await fetch(path, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error(
      `Failed to load game history (${response.status} ${response.statusText})`
    );
  }

  if (response.body) {
    const reader = response.body.getReader();
    return parseStream(reader, onProgress);
  }

  const text = await response.text();
  return parseJsonlString(text);
}
