import React from "react";

// A simple mock that simulates the presence of Highcharts-rendered DOM
export default function HighchartsReactMock() {
  return (
    <div data-testid="highcharts-react" className="highcharts-container">
      {/* Simulate the built-in credits element that Highcharts adds */}
      <div className="highcharts-credits">Highcharts.com</div>
    </div>
  );
}
