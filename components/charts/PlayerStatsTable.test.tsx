import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
jest.mock("animejs");
import { PlayerStatsTable } from "./PlayerStatsTable";

const sample = {
  rows: [
    {
      uuid: "p1",
      name: "Alice",
      appearances: 10,
      wins: 6,
      losses: 4,
      deaths: 5,
      kills: 2,
      tasksCompleted: 40,
      movementDistance: 1200,
      emergencyButtons: 1,
      sabotagesTriggered: 2,
      timeAlive: 1200,
      factions: [],
      roles: [],
    },
    {
      uuid: "p2",
      name: "Bob",
      appearances: 8,
      wins: 4,
      losses: 4,
      deaths: 3,
      kills: 5,
      tasksCompleted: 32,
      movementDistance: 900,
      emergencyButtons: 0,
      sabotagesTriggered: 1,
      timeAlive: 900,
      factions: [],
      roles: [],
    },
    {
      uuid: "p3",
      name: "Carol",
      appearances: 12,
      wins: 9,
      losses: 3,
      deaths: 2,
      kills: 8,
      tasksCompleted: 48,
      movementDistance: 2000,
      emergencyButtons: 3,
      sabotagesTriggered: 1,
      timeAlive: 2000,
      factions: [],
      roles: [],
    },
  ],
};

describe("PlayerStatsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders metrics and players", () => {
    render(<PlayerStatsTable data={sample as any} />);
    // header labels
    expect(
      screen.getByRole("columnheader", { name: /プレイヤー/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /試合数/ })
    ).toBeInTheDocument();

    // rows contain player names
    const rows = screen.getAllByRole("row");
    // header row + 3 data rows
    expect(rows).toHaveLength(4);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("sorts players by selected metric and toggles direction", () => {
    render(<PlayerStatsTable data={sample as any} />);

    // default sort metric is 試合数 (appearances) descending
    // expected row order: Carol (12), Alice (10), Bob (8)
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Carol");
    expect(rows[2]).toHaveTextContent("Alice");
    expect(rows[3]).toHaveTextContent("Bob");

    // change metric to kills by clicking kills header button
    const killsBtn = screen.getByLabelText("sort-kills");
    fireEvent.click(killsBtn);

    // now sorts by kills desc: Carol(8), Bob(5), Alice(2)
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Carol");
    expect(rows[2]).toHaveTextContent("Bob");
    expect(rows[3]).toHaveTextContent("Alice");

    // toggle direction by clicking kills header again -> ascending
    fireEvent.click(killsBtn);
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alice");
    expect(rows[2]).toHaveTextContent("Bob");
    expect(rows[3]).toHaveTextContent("Carol");
  });

  it("animates rows on sort using animejs (FLIP)", () => {
    render(<PlayerStatsTable data={sample as any} />);

    // set up getBoundingClientRect to simulate before/after positions
    const aliceRow = screen.getByText("Alice").closest("tr") as HTMLElement;
    const bobRow = screen.getByText("Bob").closest("tr") as HTMLElement;
    const carolRow = screen.getByText("Carol").closest("tr") as HTMLElement;

    // helper to create a mock that returns two different rects on subsequent calls
    function makeRectMock(beforeTop: number, afterTop: number) {
      let called = 0;
      return () => {
        called += 1;
        const top = called === 1 ? beforeTop : afterTop;
        return {
          width: 100,
          height: 32,
          top,
          bottom: top + 32,
          left: 0,
          right: 100,
          x: 0,
          y: top,
        } as DOMRect;
      };
    }

    // initial order: Carol (0), Alice (1), Bob (2)
    (carolRow.getBoundingClientRect as any) = makeRectMock(100, 100);
    (aliceRow.getBoundingClientRect as any) = makeRectMock(150, 200);
    (bobRow.getBoundingClientRect as any) = makeRectMock(200, 150);

    // Now click kills header to reorder to: Carol, Bob, Alice
    const killsBtn = screen.getByLabelText("sort-kills");
    expect(document.querySelectorAll("tr[data-uuid]")).toHaveLength(3);
    fireEvent.click(killsBtn);

    // After click, the mocked rect calls should have been used; expect animate to have been called
    const rowsAfter = screen.getAllByRole("row");
    expect(rowsAfter[1]).toHaveTextContent("Carol");
    expect(rowsAfter[2]).toHaveTextContent("Bob");
    expect(rowsAfter[3]).toHaveTextContent("Alice");
    // the DOM rect method should have been used to compute FLIP
    // ensure at least one row has inline transform applied by FLIP (before animation completes)
    const transformedRows = [rowsAfter[1], rowsAfter[2], rowsAfter[3]].filter(
      (r) => !!(r as HTMLElement).style.transform
    );
    expect(transformedRows.length).toBeGreaterThan(0);
  });
});
