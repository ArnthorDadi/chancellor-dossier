import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InvestigationTargetSelection } from "@/components/investigation-target-selection";
import type { GamePlayer } from "@/types/game-types";

// Mock players for testing
const mockPlayers: GamePlayer[] = [
  {
    id: "president-1",
    name: "President Player",
    avatar: undefined,
    isReady: true,
    joinedAt: Date.now(),
    role: "LIBERAL",
    party: "LIBERAL",
    isAlive: true,
  },
  {
    id: "player-2",
    name: "Target Player",
    avatar: undefined,
    isReady: true,
    joinedAt: Date.now(),
    role: "FASCIST",
    party: "FASCIST",
    isAlive: true,
  },
  {
    id: "player-3",
    name: "Already Investigated",
    avatar: undefined,
    isReady: true,
    joinedAt: Date.now(),
    role: "LIBERAL",
    party: "LIBERAL",
    isAlive: true,
  },
];

describe("InvestigationTargetSelection", () => {
  const mockOnInvestigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders investigation interface correctly", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
      />
    );

    expect(screen.getByText("INVESTIGATION POWER")).toBeInTheDocument();
    expect(
      screen.getByText(
        "As President, you may investigate one player's party membership"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("President Player")).toBeInTheDocument();
    expect(screen.getByText("Target Player")).toBeInTheDocument();
    expect(screen.getByText("Already Investigated")).toBeInTheDocument();
  });

  it("shows correct status for each player", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    // President (self) should show "Cannot investigate self"
    expect(screen.getByText("Cannot investigate self")).toBeInTheDocument();
    expect(screen.getByText("(YOU)")).toBeInTheDocument();

    // Already investigated player should show "Already investigated"
    expect(screen.getByText("Already investigated")).toBeInTheDocument();

    // Eligible player should show "Eligible for investigation"
    expect(screen.getByText("Eligible for investigation")).toBeInTheDocument();
  });

  it("shows investigate button only for eligible players", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    // Should have investigate button for eligible player only
    const investigateButtons = screen.getAllByText("Investigate");
    expect(investigateButtons).toHaveLength(1);

    // The button should be for the target player (not the already investigated one)
    const targetPlayerCard = screen
      .getByText("Target Player")
      .closest("[data-player-id]");
    expect(targetPlayerCard).toContainElement(investigateButtons[0]);
    expect(investigatedPlayerCard).not.toContainElement(investigateButtons[0]);
  });

  it("calls onInvestigate when investigate button is clicked", async () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    const investigateButton = screen.getByText("Investigate");
    fireEvent.click(investigateButton);

    await waitFor(() => {
      expect(mockOnInvestigate).toHaveBeenCalledWith("player-2");
    });
  });

  it("disables investigate button during loading", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        loading={true}
        alreadyInvestigated={["player-3"]}
      />
    );

    const investigateButton = screen.getByText("Investigate");
    expect(investigateButton).toBeDisabled();
    expect(investigateButton).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it("shows loading state during investigation", async () => {
    mockOnInvestigate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    const investigateButton = screen.getByText("Investigate");
    fireEvent.click(investigateButton);

    // Should show loading state
    expect(screen.getByText("Investigating...")).toBeInTheDocument();
    expect(screen.getByText("Investigating...")).toBeDisabled();
  });

  it("applies correct styling for different player states", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    // President card should have brown border
    const presidentCard = screen.getByText("President Player").closest("div");
    expect(presidentCard).toHaveClass("border-hitler-brown");

    // Already investigated card should have gray border
    const investigatedCard = screen
      .getByText("Already Investigated")
      .closest("div");
    expect(investigatedCard).toHaveClass("border-noir-black/30");

    // Eligible player card should have blue border
    const targetCard = screen.getByText("Target Player").closest("div");
    expect(targetCard).toHaveClass("border-liberal-blue");
  });

  it("displays investigation protocol instructions", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
      />
    );

    expect(screen.getByText("INVESTIGATION PROTOCOL:")).toBeInTheDocument();
    expect(
      screen.getByText(
        "• Select one player to investigate their party membership"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Investigation results are visible only to you")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Each player can only be investigated once per game")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• You cannot investigate yourself")
    ).toBeInTheDocument();
  });

  it("handles empty players list gracefully", () => {
    render(
      <InvestigationTargetSelection
        players={[]}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
      />
    );

    expect(screen.getByText("INVESTIGATION POWER")).toBeInTheDocument();
    expect(
      screen.getByText(
        "As President, you may investigate one player's party membership"
      )
    ).toBeInTheDocument();
    expect(screen.queryByText("Investigate")).not.toBeInTheDocument();
  });

  it("handles investigation error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOnInvestigate.mockRejectedValue(new Error("Investigation failed"));

    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    const investigateButton = screen.getByText("Investigate");
    fireEvent.click(investigateButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Investigation failed:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("meets accessibility requirements", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    // Check that buttons have proper sizing (44x44px minimum)
    const investigateButton = screen.getByText("Investigate");
    expect(investigateButton).toHaveClass("min-h-[44px]", "min-w-[100px]");

    // Check that all interactive elements are properly labeled
    expect(
      screen.getByRole("button", { name: "Investigate" })
    ).toBeInTheDocument();
  });

  it("shows correct player avatars with initials", () => {
    render(
      <InvestigationTargetSelection
        players={mockPlayers}
        currentPresidentId="president-1"
        onInvestigate={mockOnInvestigate}
        alreadyInvestigated={["player-3"]}
      />
    );

    // President avatar
    expect(screen.getByText("PP")).toBeInTheDocument();

    // Target player avatar
    expect(screen.getByText("TP")).toBeInTheDocument();

    // Already investigated avatar
    expect(screen.getByText("AI")).toBeInTheDocument();
  });
});
