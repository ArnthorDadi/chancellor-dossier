import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InvestigationResult } from "@/components/investigation-result";

describe("InvestigationResult", () => {
  it("renders investigation result with liberal party", () => {
    render(
      <InvestigationResult
        targetName="Test Player"
        party="LIBERAL"
        investigatedAt={Date.now()}
      />
    );

    expect(screen.getByText("INVESTIGATION COMPLETE")).toBeInTheDocument();
    expect(screen.getByText("Test Player")).toBeInTheDocument();
    expect(screen.getByText("LIBERAL PARTY")).toBeInTheDocument();
  });

  it("renders investigation result with fascist party", () => {
    render(
      <InvestigationResult
        targetName="Enemy Agent"
        party="FASCIST"
        investigatedAt={Date.now()}
      />
    );

    expect(screen.getByText("INVESTIGATION COMPLETE")).toBeInTheDocument();
    expect(screen.getByText("Enemy Agent")).toBeInTheDocument();
    expect(screen.getByText("FASCIST PARTY")).toBeInTheDocument();
  });

  it("displays player initials in avatar", () => {
    render(
      <InvestigationResult
        targetName="John Doe"
        party="LIBERAL"
        investigatedAt={Date.now()}
      />
    );

    expect(screen.getByText("JO")).toBeInTheDocument();
  });

  it("shows confidential message", () => {
    render(
      <InvestigationResult
        targetName="Test Player"
        party="LIBERAL"
        investigatedAt={Date.now()}
      />
    );

    expect(screen.getByText(/CONFIDENTIAL/i)).toBeInTheDocument();
  });

  it("applies correct styling for liberal party", () => {
    render(
      <InvestigationResult
        targetName="Test Player"
        party="LIBERAL"
        investigatedAt={Date.now()}
      />
    );

    const liberalText = screen.getByText("LIBERAL PARTY");
    expect(liberalText).toHaveClass("bg-liberal-blue");
  });

  it("applies correct styling for fascist party", () => {
    render(
      <InvestigationResult
        targetName="Test Player"
        party="FASCIST"
        investigatedAt={Date.now()}
      />
    );

    const fascistText = screen.getByText("FASCIST PARTY");
    expect(fascistText).toHaveClass("bg-fascist-red");
  });
});
