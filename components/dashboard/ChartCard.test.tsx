import React from "react";
import { render, screen } from "@testing-library/react";

// Use the manual mock for highcharts-react-official
jest.mock("highcharts-react-official");

import { ChartCard } from "@/components/dashboard/ChartCard";
import { BaseChart } from "@/components/charts/BaseChart";

describe("ChartCard", () => {
  it("renders header and children (chart wrapper) and places credits inside wrapper", () => {
    render(
      <ChartCard title="Test Title" description="A description">
        <BaseChart options={{}} />
      </ChartCard>
    );

    // Heading
    expect(
      screen.getByRole("heading", { name: /Test Title/i })
    ).toBeInTheDocument();

    // Chart wrapper exists
    const wrapper = screen.getByTestId("chart-wrapper");
    expect(wrapper).toBeInTheDocument();
    // The wrapper should be inside the ChartCard's section
    const section = screen
      .getByRole("heading", { name: /Test Title/i })
      .closest("section");
    expect(section).toContainElement(wrapper);

    // The mocked Highcharts React element should be in the wrapper
    const mock = screen.getByTestId("highcharts-react");
    expect(wrapper).toContainElement(mock);

    // The mocked .highcharts-credits should be present and inside the wrapper
    expect(wrapper).toContainElement(screen.getByText(/Highcharts.com/));
  });

  it("renders as a relatively-positioned Card so absolute children are constrained", () => {
    render(
      <ChartCard title="Relative Test">
        <div />
      </ChartCard>
    );

    const section = screen
      .getByRole("heading", { name: /Relative Test/i })
      .closest("section");
    expect(section).toHaveClass("relative");
  });
});
