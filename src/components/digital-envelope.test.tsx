import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DigitalEnvelope } from "@/components/digital-envelope";
import type { Role, Party } from "@/types/game-types";

describe("DigitalEnvelope", () => {
  const mockProps = {
    role: "LIBERAL" as Role,
    party: "LIBERAL" as Party,
  };

  describe("when role and party are provided", () => {
    it("renders the closed envelope by default", () => {
      render(<DigitalEnvelope {...mockProps} />);

      expect(screen.getByText("SECRET DOSSIER")).toBeInTheDocument();
      expect(screen.getByText("TOP SECRET")).toBeInTheDocument();
      expect(screen.getByText("CLASSIFIED DOCUMENT")).toBeInTheDocument();
      expect(screen.getByText("OPEN ENVELOPE")).toBeInTheDocument();
      expect(screen.queryByText("LIBERAL")).not.toBeInTheDocument();
    });

    it("opens envelope when button is clicked", () => {
      render(<DigitalEnvelope {...mockProps} />);

      const openButton = screen.getByText("OPEN ENVELOPE");
      fireEvent.click(openButton);

      expect(screen.getByText("CLOSE ENVELOPE")).toBeInTheDocument();
      expect(screen.getByText("LIBERAL")).toBeInTheDocument();
      expect(screen.getByText("LIBERAL PARTY")).toBeInTheDocument();
    });

    it("closes envelope when close button is clicked", () => {
      render(<DigitalEnvelope {...mockProps} />);

      const openButton = screen.getByText("OPEN ENVELOPE");
      fireEvent.click(openButton);

      const closeButton = screen.getByText("CLOSE ENVELOPE");
      fireEvent.click(closeButton);

      expect(screen.getByText("OPEN ENVELOPE")).toBeInTheDocument();
      expect(screen.queryByText("LIBERAL")).not.toBeInTheDocument();
    });

    it("uses controlled open state when provided", () => {
      const onToggle = vi.fn();
      render(
        <DigitalEnvelope {...mockProps} isOpen={true} onToggle={onToggle} />
      );

      expect(screen.getByText("CLOSE ENVELOPE")).toBeInTheDocument();
      expect(screen.getByText("LIBERAL")).toBeInTheDocument();

      const toggleButton = screen.getByText("CLOSE ENVELOPE");
      fireEvent.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("uses internal state when no control props provided", () => {
      render(<DigitalEnvelope {...mockProps} />);

      const openButton = screen.getByText("OPEN ENVELOPE");
      fireEvent.click(openButton);

      expect(screen.getByText("LIBERAL")).toBeInTheDocument();
      expect(screen.getByText("CLOSE ENVELOPE")).toBeInTheDocument();
    });
  });

  describe("role card display", () => {
    it("displays LIBERAL role correctly", () => {
      render(<DigitalEnvelope role="LIBERAL" party="LIBERAL" isOpen={true} />);

      expect(screen.getByText("LIBERAL")).toBeInTheDocument();
      expect(
        screen.getByText("Protect democracy and enact liberal policies")
      ).toBeInTheDocument();
    });

    it("displays FASCIST role correctly", () => {
      render(<DigitalEnvelope role="FASCIST" party="FASCIST" isOpen={true} />);

      expect(screen.getByText("FASCIST")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Enact fascist policies and elect Hitler as Chancellor"
        )
      ).toBeInTheDocument();
    });

    it("displays HITLER role correctly", () => {
      render(<DigitalEnvelope role="HITLER" party="FASCIST" isOpen={true} />);

      expect(screen.getByText("HITLER")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Get elected Chancellor or enact 6 fascist policies to win"
        )
      ).toBeInTheDocument();
    });
  });

  describe("party card display", () => {
    it("displays LIBERAL party correctly", () => {
      render(<DigitalEnvelope role="LIBERAL" party="LIBERAL" isOpen={true} />);

      expect(screen.getByText("LIBERAL PARTY")).toBeInTheDocument();
      expect(
        screen.getByText("Member of the Liberal Party")
      ).toBeInTheDocument();
    });

    it("displays FASCIST party correctly", () => {
      render(<DigitalEnvelope role="LIBERAL" party="FASCIST" isOpen={true} />);

      expect(screen.getByText("FASCIST PARTY")).toBeInTheDocument();
      expect(
        screen.getByText("Member of the Fascist Party")
      ).toBeInTheDocument();
    });
  });

  describe("when role or party is missing", () => {
    it("shows unavailable message when role is missing", () => {
      render(<DigitalEnvelope party="LIBERAL" />);

      expect(
        screen.getByText("ROLE INFORMATION UNAVAILABLE")
      ).toBeInTheDocument();
      expect(screen.queryByText("OPEN ENVELOPE")).not.toBeInTheDocument();
    });

    it("shows unavailable message when party is missing", () => {
      render(<DigitalEnvelope role="LIBERAL" />);

      expect(
        screen.getByText("ROLE INFORMATION UNAVAILABLE")
      ).toBeInTheDocument();
      expect(screen.queryByText("OPEN ENVELOPE")).not.toBeInTheDocument();
    });

    it("shows unavailable message when both are missing", () => {
      render(<DigitalEnvelope />);

      expect(
        screen.getByText("ROLE INFORMATION UNAVAILABLE")
      ).toBeInTheDocument();
      expect(screen.queryByText("OPEN ENVELOPE")).not.toBeInTheDocument();
    });
  });

  describe("instructions and styling", () => {
    it("shows instructions when envelope is closed", () => {
      render(<DigitalEnvelope {...mockProps} />);

      expect(
        screen.getByText("Press OPEN ENVELOPE to reveal your secret role")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Keep your identity confidential from other players")
      ).toBeInTheDocument();
    });

    it("hides instructions when envelope is open", () => {
      render(<DigitalEnvelope {...mockProps} isOpen={true} />);

      expect(
        screen.queryByText("Press OPEN ENVELOPE to reveal your secret role")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Keep your identity confidential from other players")
      ).not.toBeInTheDocument();
    });
  });

  describe("button variants", () => {
    it("shows outline variant when open", () => {
      render(<DigitalEnvelope {...mockProps} isOpen={true} />);

      const button = screen.getByText("CLOSE ENVELOPE");
      expect(button).toHaveClass("border-liberal-blue", "text-liberal-blue");
    });

    it("shows default variant when closed", () => {
      render(<DigitalEnvelope {...mockProps} />);

      const button = screen.getByText("OPEN ENVELOPE");
      expect(button).toHaveClass("bg-liberal-blue", "text-white");
    });
  });

  describe("accessibility", () => {
    it("has proper button text for state changes", () => {
      render(<DigitalEnvelope {...mockProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("OPEN ENVELOPE");

      fireEvent.click(button);
      expect(button).toHaveTextContent("CLOSE ENVELOPE");
    });

    it("maintains proper semantic structure", () => {
      render(<DigitalEnvelope {...mockProps} />);

      expect(
        screen.getByRole("heading", { name: "SECRET DOSSIER" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("responsive design", () => {
    it("has responsive container classes", () => {
      const { container } = render(<DigitalEnvelope {...mockProps} />);

      const envelopeContainer = container.querySelector(".max-w-md");
      expect(envelopeContainer).toBeInTheDocument();

      const mainContainer = container.querySelector(".w-full");
      expect(mainContainer).toBeInTheDocument();
    });
  });
});
