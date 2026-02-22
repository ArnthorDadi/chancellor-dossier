import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RoomSharingOptions } from "./room-sharing-options";

const mockClipboard = {
  writeText: vi.fn(),
};

vi.stubGlobal("navigator", {
  clipboard: mockClipboard,
  share: vi.fn(),
});

describe("RoomSharingOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders room code and share options", () => {
    render(<RoomSharingOptions roomCode="TEST1" />);

    expect(screen.getByText("SHARE THIS SAFE HOUSE")).toBeInTheDocument();
    expect(screen.getByText("COPY INVITE LINK")).toBeInTheDocument();
    expect(screen.getByText("SHOW QR CODE")).toBeInTheDocument();
  });

  it("copies room link to clipboard when copy button is clicked", async () => {
    render(<RoomSharingOptions roomCode="TEST1" />);

    const copyButton = screen.getByText("COPY INVITE LINK");
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("TEST1")
    );
  });

  it("shows 'LINK COPIED!' after copying", async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<RoomSharingOptions roomCode="TEST1" />);

    const copyButton = screen.getByText("COPY INVITE LINK");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("LINK COPIED!")).toBeInTheDocument();
    });
  });

  it("toggles QR code visibility", () => {
    render(<RoomSharingOptions roomCode="TEST1" />);

    expect(
      screen.queryByAltText("QR Code for room link")
    ).not.toBeInTheDocument();

    const qrButton = screen.getByText("SHOW QR CODE");
    fireEvent.click(qrButton);

    expect(screen.getByAltText("QR Code for room link")).toBeInTheDocument();
    expect(screen.getByText("HIDE QR CODE")).toBeInTheDocument();
  });

  it("displays room code in helper text", () => {
    render(<RoomSharingOptions roomCode="ABC123" />);

    expect(screen.getByText(/ABC123/)).toBeInTheDocument();
  });
});
