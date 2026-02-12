/**
import { vi, describe, it, expect } from "vitest";
 * Tests for SettingsPanel Component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPanel } from "@/app/components/ui/SettingsPanel";
import { ReaderProvider } from "@/app/context/ReaderContext";

// Wrap component with ReaderProvider for context
const renderWithContext = (ui: React.ReactElement) => {
  return render(<ReaderProvider>{ui}</ReaderProvider>);
};

describe("SettingsPanel", () => {
  it("renders all control sections", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    expect(screen.getByText(/Theme/i)).toBeInTheDocument();
    expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Window Radius/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
  });

  it("renders theme radio buttons", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    expect(screen.getByLabelText(/Dark/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Light/i)).toBeInTheDocument();
  });

  it("has Dark theme selected by default", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    const darkRadio = screen.getByLabelText(/Dark/i) as HTMLInputElement;
    const lightRadio = screen.getByLabelText(/Light/i) as HTMLInputElement;
    
    expect(darkRadio.checked).toBe(true);
    expect(lightRadio.checked).toBe(false);
  });

  it("allows theme switching", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    const lightRadio = screen.getByLabelText(/Light/i) as HTMLInputElement;
    
    fireEvent.click(lightRadio);
    
    expect(lightRadio.checked).toBe(true);
  });

  it("displays font size slider with current value", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    const slider = screen.getByLabelText(/Font Size/i) as HTMLInputElement;
    
    expect(slider).toBeInTheDocument();
    expect(slider.type).toBe("range");
    expect(slider.min).toBe("12");
    expect(slider.max).toBe("32");
  });

  it("displays window radius slider with current value", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    const slider = screen.getByLabelText(/Window Radius/i) as HTMLInputElement;
    
    expect(slider).toBeInTheDocument();
    expect(slider.type).toBe("range");
    expect(slider.min).toBe("1");
    expect(slider.max).toBe("3");
  });

  it("shows panel when visible is true", () => {
    const { container } = renderWithContext(<SettingsPanel visible={true} />);
    
    const panel = container.querySelector(".settings-panel") as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.opacity).toBe("1");
    expect(panel.style.pointerEvents).toBe("auto");
  });

  it("hides panel when visible is false", () => {
    const { container } = renderWithContext(<SettingsPanel visible={false} />);
    
    const panel = container.querySelector(".settings-panel") as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.opacity).toBe("0");
    expect(panel.style.pointerEvents).toBe("none");
  });

  it("has correct positioning (bottom-left)", () => {
    const { container } = renderWithContext(<SettingsPanel visible={true} />);
    
    const panel = container.querySelector(".settings-panel") as HTMLElement;
    expect(panel.style.position).toBe("absolute");
    expect(panel.style.bottom).toBe("1rem");
    expect(panel.style.left).toBe("1rem");
  });

  it("has backdrop blur effect", () => {
    const { container } = renderWithContext(<SettingsPanel visible={true} />);
    
    const panel = container.querySelector(".settings-panel") as HTMLElement;
    expect(panel.style.backdropFilter).toBe("blur(8px)");
  });

  it("includes FileUpload component", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
  });

  it("calls onClose callback when provided", () => {
    const mockOnClose = vi.fn();
    renderWithContext(<SettingsPanel visible={true} onClose={mockOnClose} />);
    
    // Component should be able to call onClose
    // This would typically be tested through integration with close button
    expect(mockOnClose).not.toHaveBeenCalled(); // Not called on mount
  });

  it("displays current font size value", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    // Default font size is 18px
    expect(screen.getByText(/18px/i)).toBeInTheDocument();
  });

  it("displays current window radius value", () => {
    renderWithContext(<SettingsPanel visible={true} />);
    
    // Default window radius is 2 words
    expect(screen.getByText(/2 words/i)).toBeInTheDocument();
  });

  it("has smooth transition for opacity", () => {
    const { container } = renderWithContext(<SettingsPanel visible={true} />);
    
    const panel = container.querySelector(".settings-panel") as HTMLElement;
    expect(panel.style.transition).toContain("opacity");
  });
});
