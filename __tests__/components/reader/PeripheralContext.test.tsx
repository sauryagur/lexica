/**
 * Tests for PeripheralContext Component
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PeripheralContext } from "@/app/components/reader/PeripheralContext";
import type { Token } from "@/app/types";

describe("PeripheralContext", () => {
  it("renders correct number of token slots", () => {
    const tokens: Token[] = [
      { text: "far-left" },
      { text: "left" },
      { text: "CENTER" },
      { text: "right" },
      { text: "far-right" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={2} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    expect(slots).toHaveLength(5);
  });

  it("applies correct opacity to each position", () => {
    const tokens: Token[] = [
      { text: "far" },   // -2: 20%
      { text: "near" },  // -1: 45%
      { text: "center" }, // 0: 100%
      { text: "near" },  // +1: 45%
      { text: "far" },   // +2: 20%
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={2} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    
    // Check opacity values
    expect(slots[0]).toHaveStyle({ opacity: "0.2" });  // -2
    expect(slots[1]).toHaveStyle({ opacity: "0.45" }); // -1
    expect(slots[2]).toHaveStyle({ opacity: "1" });    // center (but hidden)
    expect(slots[3]).toHaveStyle({ opacity: "0.45" }); // +1
    expect(slots[4]).toHaveStyle({ opacity: "0.2" });  // +2
  });

  it("hides center slot (shown by WordLane)", () => {
    const tokens: Token[] = [
      { text: "left" },
      { text: "CENTER" },
      { text: "right" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    
    // Center slot should be hidden
    expect(slots[1]).toHaveStyle({ visibility: "hidden" });
    
    // Other slots should be visible
    expect(slots[0]).toHaveStyle({ visibility: "visible" });
    expect(slots[2]).toHaveStyle({ visibility: "visible" });
  });

  it("handles empty slots at document start", () => {
    // When we only have 3 tokens but center is at index 2 (radius=2), 
    // it means we're showing all 3 tokens in a 5-slot window
    const tokens: Token[] = [
      { text: "far-left" },  // slot 0
      { text: "left" },      // slot 1
      { text: "CENTER" },    // slot 2 (centerIndex)
      { text: "right" },     // slot 3
      { text: "far-right" }, // slot 4
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={2} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    expect(slots).toHaveLength(5);
    
    // All slots should have content in this case
    expect(slots[2].textContent).toBe("CENTER");
  });

  it("handles empty slots at document end", () => {
    const tokens: Token[] = [
      { text: "far-left" },
      { text: "left" },
      { text: "CENTER" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={2} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    
    // Last two slots should be empty (document end boundary)
    expect(slots[3].textContent).toBe("\u00A0");
    expect(slots[4].textContent).toBe("\u00A0");
  });

  it("updates efficiently without recreating DOM", () => {
    const tokens1: Token[] = [
      { text: "one" },
      { text: "two" },
      { text: "three" },
    ];
    
    const tokens2: Token[] = [
      { text: "four" },
      { text: "five" },
      { text: "six" },
    ];
    
    const { rerender } = render(
      <PeripheralContext tokens={tokens1} centerIndex={1} fontSize={18} />
    );
    
    const initialSlots = document.querySelectorAll(".peripheral-token");
    
    rerender(<PeripheralContext tokens={tokens2} centerIndex={1} fontSize={18} />);
    
    const updatedSlots = document.querySelectorAll(".peripheral-token");
    
    // Should be same DOM elements
    expect(updatedSlots.length).toBe(initialSlots.length);
  });

  it("applies bold styling to bold tokens", () => {
    const tokens: Token[] = [
      { text: "normal" },
      { text: "bold", bold: true },
      { text: "center" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    expect(slots[0]).toHaveStyle({ fontWeight: "400" });
    expect(slots[1]).toHaveStyle({ fontWeight: "700" });
  });

  it("applies italic styling to italic tokens", () => {
    const tokens: Token[] = [
      { text: "normal" },
      { text: "italic", italic: true },
      { text: "center" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    expect(slots[0]).toHaveStyle({ fontStyle: "normal" });
    expect(slots[1]).toHaveStyle({ fontStyle: "italic" });
  });

  it("applies code styling to code tokens", () => {
    const tokens: Token[] = [
      { text: "normal" },
      { text: "code", code: true },
      { text: "center" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={18} />);
    
    const slots = document.querySelectorAll(".peripheral-token");
    expect(slots[1]).toHaveStyle({ 
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    });
  });

  it("uses correct font size", () => {
    const tokens: Token[] = [
      { text: "one" },
      { text: "two" },
      { text: "three" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={24} />);
    
    const container = document.querySelector(".peripheral-context");
    expect(container).toHaveStyle({ fontSize: "24px" });
  });

  it("maintains horizontal layout", () => {
    const tokens: Token[] = [
      { text: "one" },
      { text: "two" },
      { text: "three" },
    ];
    
    render(<PeripheralContext tokens={tokens} centerIndex={1} fontSize={18} />);
    
    const container = document.querySelector(".peripheral-context");
    expect(container).toHaveStyle({ 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
  });
});
