import React from "react";

// A simple mock that simulates the presence of Highcharts-rendered DOM
export default function HighchartsReactMock(props: any) {
  // Try to serialize options for tests; some options may be functions and
  // not serializable, so we catch errors and fall back to empty string.
  let json = "";
  try {
    // Preserve functions by stringifying them so tests can inspect
    // formatter implementations in options.
    json = JSON.stringify(
      props.options || {},
      (_key: string, value: any) => {
        if (typeof value === "function") {
          return value.toString();
        }
        return value;
      },
      2
    );
  } catch {
    json = "";
  }

  return (
    <div
      data-testid="highcharts-react"
      className="highcharts-container"
      data-options={json}
    >
      {/* Simulate the built-in credits element that Highcharts adds */}
      <div className="highcharts-credits">Highcharts.com</div>
    </div>
  );
}
