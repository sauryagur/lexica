/**
 * Tests for Breadcrumb Component
 */

import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";

describe("Breadcrumb", () => {
  it("renders path correctly with separator", () => {
    const path = ["Chapter 3", "Neural Plasticity"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    expect(container.textContent).toBe("Chapter 3 › Neural Plasticity");
  });

  it("uses › separator between items", () => {
    const path = ["A", "B", "C"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    expect(container.textContent).toContain("›");
    expect(container.textContent).toBe("A › B › C");
  });

  it("handles empty path by not rendering", () => {
    const { container } = render(<Breadcrumb path={[]} visible={true} />);
    
    expect(container.firstChild).toBeNull();
  });

  it("handles single item path", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    expect(container.textContent).toBe("Chapter 1");
  });

  it("truncates long paths to max 3 levels", () => {
    const path = ["Book", "Part 1", "Chapter 3", "Section A", "Subsection B"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    // Should show only last 3 items
    expect(container.textContent).toBe("Chapter 3 › Section A › Subsection B");
    expect(container.textContent).not.toContain("Book");
    expect(container.textContent).not.toContain("Part 1");
  });

  it("shows breadcrumb when visible is true", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.style.opacity).toBe("0.5");
  });

  it("hides breadcrumb when visible is false", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={false} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.style.opacity).toBe("0");
  });

  it("has correct positioning (top-left)", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb.style.position).toBe("absolute");
    expect(breadcrumb.style.top).toBe("1rem");
    expect(breadcrumb.style.left).toBe("1rem");
  });

  it("has correct font size (0.875rem)", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb.style.fontSize).toBe("0.875rem");
  });

  it("has transition for opacity", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb.style.transition).toContain("opacity");
  });

  it("is non-interactive (pointer-events: none)", () => {
    const path = ["Chapter 1"];
    const { container } = render(<Breadcrumb path={path} visible={true} />);
    
    const breadcrumb = container.firstChild as HTMLElement;
    expect(breadcrumb.style.pointerEvents).toBe("none");
  });
});
