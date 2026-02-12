/**
 * Tests for ScrubBar Component
 */

import { render, fireEvent } from "@testing-library/react";
import { ScrubBar } from "@/app/components/ui/ScrubBar";
import { vi, describe, it, expect } from "vitest";

describe("ScrubBar", () => {
  it("renders with correct progress", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    // Get the progress fill div (second div child)
    const divs = container.querySelectorAll("div");
    const progressFill = divs[1] as HTMLElement;
    expect(progressFill.style.width).toBe("50%");
  });

  it("shows scrub bar when visible is true", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.opacity).toBe("1");
  });

  it("hides scrub bar when visible is false", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={false} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.opacity).toBe("0");
  });

  it("has correct positioning (bottom)", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.position).toBe("absolute");
    expect(scrubBar.style.bottom).toBe("0px");
    expect(scrubBar.style.left).toBe("0px");
    expect(scrubBar.style.right).toBe("0px");
  });

  it("has thin height by default (3px)", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.height).toBe("3px");
  });

  it("expands on hover", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    
    fireEvent.mouseEnter(scrubBar);
    
    expect(scrubBar.style.height).toBe("10px");
  });

  it("calls onSeek when clicked", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    
    // Mock getBoundingClientRect
    scrubBar.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      width: 1000,
      top: 0,
      right: 1000,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent.click(scrubBar, { clientX: 500 });
    
    expect(mockOnSeek).toHaveBeenCalledWith(50);
  });

  it("calls onSeek with correct percentage on click at start", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    
    scrubBar.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      width: 1000,
      top: 0,
      right: 1000,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent.click(scrubBar, { clientX: 0 });
    
    expect(mockOnSeek).toHaveBeenCalledWith(0);
  });

  it("calls onSeek with correct percentage on click at end", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    
    scrubBar.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      width: 1000,
      top: 0,
      right: 1000,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent.click(scrubBar, { clientX: 1000 });
    
    expect(mockOnSeek).toHaveBeenCalledWith(100);
  });

  it("displays progress thumb indicator", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const thumb = container.querySelectorAll("div")[2] as HTMLElement;
    expect(thumb.style.left).toBe("50%");
    expect(thumb.style.borderRadius).toBe("50%");
  });

  it("expands thumb on hover", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    const thumb = container.querySelectorAll("div")[2] as HTMLElement;
    
    expect(thumb.style.width).toBe("8px");
    
    fireEvent.mouseEnter(scrubBar);
    
    expect(thumb.style.width).toBe("12px");
  });

  it("handles drag to seek", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    
    scrubBar.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      width: 1000,
      top: 0,
      right: 1000,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));
    
    fireEvent.mouseDown(scrubBar, { clientX: 250 });
    
    expect(mockOnSeek).toHaveBeenCalledWith(25);
  });

  it("has cursor pointer", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.cursor).toBe("pointer");
  });

  it("has smooth transition", () => {
    const mockOnSeek = vi.fn();
    const { container } = render(
      <ScrubBar progress={50} visible={true} onSeek={mockOnSeek} />
    );
    
    const scrubBar = container.firstChild as HTMLElement;
    expect(scrubBar.style.transition).toContain("opacity");
    expect(scrubBar.style.transition).toContain("height");
  });
});
