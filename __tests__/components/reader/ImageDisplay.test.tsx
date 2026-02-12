/**
 * Tests for ImageDisplay Component
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ImageDisplay } from "@/app/components/reader/ImageDisplay";
import type { ImageNode } from "@/app/types";

describe("ImageDisplay", () => {
  it("renders image with correct src", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      alt: "Test image",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("renders image with alt text", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      alt: "A beautiful landscape",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "A beautiful landscape");
  });

  it("uses default alt text when not provided", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Document image");
  });

  it("shows alt text on image load error", async () => {
    const image: ImageNode = {
      src: "https://example.com/broken.jpg",
      alt: "This should show as fallback",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img") as HTMLImageElement;
    
    // Simulate image load error
    img.dispatchEvent(new Event("error"));
    
    await waitFor(() => {
      expect(screen.getByText("Image unavailable")).toBeInTheDocument();
      expect(screen.getByText("This should show as fallback")).toBeInTheDocument();
    });
  });

  it("shows source URL in error fallback", async () => {
    const image: ImageNode = {
      src: "https://example.com/broken.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    
    await waitFor(() => {
      expect(screen.getByText("https://example.com/broken.jpg")).toBeInTheDocument();
    });
  });

  it("centers image correctly", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const container = document.querySelector(".image-display");
    expect(container).toHaveStyle({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    });
  });

  it("respects max dimensions", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const container = document.querySelector(".image-display");
    // Check that max dimensions are set (they'll be computed in real browser)
    expect(container).toBeInTheDocument();
    const style = container?.getAttribute("style");
    expect(style).toContain("max-width");
    expect(style).toContain("max-height");
  });

  it("applies object-fit contain to image", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img");
    expect(img).toHaveStyle({
      objectFit: "contain",
    });
  });

  it("shows opacity transition on load", async () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const container = document.querySelector(".image-display");
    
    // Initially should have opacity 0
    expect(container).toHaveStyle({ opacity: "0" });
    
    // Simulate image load
    const img = screen.getByRole("img") as HTMLImageElement;
    img.dispatchEvent(new Event("load"));
    
    await waitFor(() => {
      expect(container).toHaveStyle({ opacity: "1" });
    });
  });

  it("displays alt text caption when image loads", async () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      alt: "Caption text",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const img = screen.getByRole("img") as HTMLImageElement;
    
    // Before load, caption might not be visible
    expect(screen.queryByText("Caption text")).not.toBeInTheDocument();
    
    // Simulate load
    img.dispatchEvent(new Event("load"));
    
    await waitFor(() => {
      // After load, should show caption
      const captions = screen.getAllByText("Caption text");
      expect(captions.length).toBeGreaterThan(0);
    });
  });

  it("has smooth transition styling", () => {
    const image: ImageNode = {
      src: "https://example.com/image.jpg",
      tokenIndex: 0,
    };
    
    render(<ImageDisplay image={image} />);
    
    const container = document.querySelector(".image-display");
    expect(container).toHaveStyle({
      transition: "opacity 0.2s ease-in-out",
    });
  });
});
