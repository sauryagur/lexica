/**
 * Tests for ProgressIndicator Component
 */

import { render, screen } from "@testing-library/react";
import { ProgressIndicator } from "@/app/components/ui/ProgressIndicator";

describe("ProgressIndicator", () => {
  it("displays correct percentage with no decimals", () => {
    const { container } = render(<ProgressIndicator progress={21.5} visible={true} />);
    
    expect(container.textContent).toContain("22%");
  });

  it("rounds down for values below .5", () => {
    const { container } = render(<ProgressIndicator progress={21.4} visible={true} />);
    
    expect(container.textContent).toContain("21%");
  });

  it("rounds up for values at or above .5", () => {
    const { container } = render(<ProgressIndicator progress={21.5} visible={true} />);
    
    expect(container.textContent).toContain("22%");
  });

  it("handles 0% correctly", () => {
    const { container } = render(<ProgressIndicator progress={0} visible={true} />);
    
    expect(container.textContent).toContain("0%");
  });

  it("handles 100% correctly", () => {
    const { container } = render(<ProgressIndicator progress={100} visible={true} />);
    
    expect(container.textContent).toContain("100%");
  });

  it("shows indicator when visible is true", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toBeTruthy();
    expect(indicator.style.opacity).toBe("0.5");
  });

  it("hides indicator when visible is false", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={false} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator).toBeTruthy();
    expect(indicator.style.opacity).toBe("0");
  });

  it("has correct positioning (bottom-right)", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator.style.position).toBe("absolute");
    expect(indicator.style.bottom).toBe("1rem");
    expect(indicator.style.right).toBe("1rem");
  });

  it("has correct font size (0.875rem)", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator.style.fontSize).toBe("0.875rem");
  });

  it("includes diamond icon SVG", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe("12");
    expect(svg?.getAttribute("height")).toBe("12");
  });

  it("has transition for opacity", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator.style.transition).toContain("opacity");
  });

  it("is non-interactive (pointer-events: none)", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator.style.pointerEvents).toBe("none");
  });

  it("displays flex layout with gap", () => {
    const { container } = render(<ProgressIndicator progress={50} visible={true} />);
    
    const indicator = container.firstChild as HTMLElement;
    expect(indicator.style.display).toBe("flex");
    expect(indicator.style.alignItems).toBe("center");
  });
});
