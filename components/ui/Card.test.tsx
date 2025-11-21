import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders header, description, actions, footer and span class", () => {
    render(
      <Card
        title="Card Title"
        description="desc"
        actions={<div>act</div>}
        footer={<div>footer</div>}
        span="lg:col-span-7"
      >
        <div>content</div>
      </Card>
    );

    expect(screen.getByText(/Card Title/i)).toBeInTheDocument();
    expect(screen.getByText(/desc/i)).toBeInTheDocument();
    expect(screen.getByText(/act/i)).toBeInTheDocument();
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("lg:col-span-7");
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });
});
