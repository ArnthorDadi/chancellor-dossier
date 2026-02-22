import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoomCodeDisplay } from "./room-code-display";

const mockClipboard = {
  writeText: vi.fn(),
};

vi.stubGlobal("navigator", {
  clipboard: mockClipboard,
});

describe("RoomCodeDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders room code correctly", () => {
    render(<RoomCodeDisplay roomCode="TEST1" showSharingOptions={false} />);

    expect(screen.getAllByText("TEST1")).toHaveLength(1);
    expect(screen.getByText("ROOM CODE")).toBeInTheDocument();
  });

  it("displays copy code button", () => {
    render(<RoomCodeDisplay roomCode="TEST1" />);

    expect(
      screen.getByRole("button", { name: /COPY CODE/i })
    ).toBeInTheDocument();
  });

  it("copies room code to clipboard when clicked", async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<RoomCodeDisplay roomCode="TEST1" />);

    const copyButton = screen.getByRole("button", { name: /COPY CODE/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith("TEST1");
    });
  });

  it("shows 'COPIED!' after copying", async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<RoomCodeDisplay roomCode="TEST1" />);

    const copyButton = screen.getByRole("button", { name: /COPY CODE/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("✓ COPIED!")).toBeInTheDocument();
    });
  });

  it("shows sharing options by default", () => {
    render(<RoomCodeDisplay roomCode="TEST1" />);

    expect(screen.getByText("SHARE THIS SAFE HOUSE")).toBeInTheDocument();
    expect(screen.getByText("COPY INVITE LINK")).toBeInTheDocument();
  });

  it("hides sharing options when showSharingOptions is false", () => {
    render(<RoomCodeDisplay roomCode="TEST1" showSharingOptions={false} />);

    expect(screen.queryByText("SHARE THIS SAFE HOUSE")).not.toBeInTheDocument();
  });

  it("shows success animation when isNewRoom is true", async () => {
    render(<RoomCodeDisplay roomCode="TEST1" isNewRoom={true} />);

    await waitFor(() => {
      expect(screen.getByText("SAFE HOUSE ESTABLISHED!")).toBeInTheDocument();
    });
  });
});
