/**
 * Tests for FileUpload Component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileUpload } from "@/app/components/ui/FileUpload";
import { vi, describe, it, expect } from "vitest";

describe("FileUpload", () => {
  it("renders upload button", () => {
    const mockOnFileLoad = vi.fn();
    render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    expect(screen.getByText("Upload Document")).toBeInTheDocument();
  });

  it("triggers file input on button click", () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");
    
    const button = screen.getByText("Upload Document");
    fireEvent.click(button);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it("accepts .md and .txt files", () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput.accept).toBe(".md,.txt,.markdown");
  });

  it("shows loading state while reading file", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const file = new File(["# Test"], "test.md", { type: "text/markdown" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock FileReader to delay
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeInTheDocument();
    });
  });

  it("reads markdown files and calls onFileLoad", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const fileContent = "# Test Document\n\nThis is a test.";
    const file = new File([fileContent], "test.md", { type: "text/markdown" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: fileContent,
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Trigger onload
    mockFileReader.onload({ target: { result: fileContent } });
    
    await waitFor(() => {
      expect(mockOnFileLoad).toHaveBeenCalledWith(fileContent, "test.md");
    });
  });

  it("validates file type and shows error for invalid files", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
    
    expect(mockOnFileLoad).not.toHaveBeenCalled();
  });

  it("validates file size and shows error for large files", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    // Create a file larger than 10MB
    const largeContent = "x".repeat(11 * 1024 * 1024);
    const file = new File([largeContent], "large.md", { type: "text/markdown" });
    
    // Override size property
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });
    
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/File too large/i)).toBeInTheDocument();
    });
    
    expect(mockOnFileLoad).not.toHaveBeenCalled();
  });

  it("displays file name after successful upload", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const fileContent = "# Test";
    const file = new File([fileContent], "my-document.md", { type: "text/markdown" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: fileContent,
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Trigger onload
    mockFileReader.onload({ target: { result: fileContent } });
    
    await waitFor(() => {
      expect(screen.getByText("my-document.md")).toBeInTheDocument();
    });
  });

  it("handles read errors gracefully", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const file = new File(["# Test"], "test.md", { type: "text/markdown" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock FileReader with error
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Trigger onerror
    mockFileReader.onerror();
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to read file/i)).toBeInTheDocument();
    });
    
    expect(mockOnFileLoad).not.toHaveBeenCalled();
  });

  it("resets file input after upload", async () => {
    const mockOnFileLoad = vi.fn();
    const { container } = render(<FileUpload onFileLoad={mockOnFileLoad} />);
    
    const fileContent = "# Test";
    const file = new File([fileContent], "test.md", { type: "text/markdown" });
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      onerror: null as any,
      result: fileContent,
    };
    
    global.FileReader = vi.fn(() => mockFileReader) as any;
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Trigger onload
    mockFileReader.onload({ target: { result: fileContent } });
    
    await waitFor(() => {
      expect(fileInput.value).toBe("");
    });
  });
});
