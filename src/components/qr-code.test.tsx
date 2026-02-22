import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { QRCode } from "./qr-code";

describe("QRCode", () => {
  it("renders QR code image with correct src", () => {
    render(<QRCode value="https://example.com/room/ABC123" size={128} />);

    const img = screen.getByAltText("QR Code for room link");
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toContain("qrserver.com");
    expect((img as HTMLImageElement).src).toContain("128");
    expect((img as HTMLImageElement).src).toContain("ABC123");
  });

  it("uses custom size when provided", () => {
    render(<QRCode value="https://example.com" size={256} />);

    const img = screen.getByAltText("QR Code for room link");
    expect(img.getAttribute("width")).toBe("256");
    expect(img.getAttribute("height")).toBe("256");
  });

  it("applies custom className", () => {
    render(<QRCode value="https://example.com" className="custom-class" />);

    const img = screen.getByAltText("QR Code for room link");
    expect(img).toHaveClass("custom-class");
  });
});
