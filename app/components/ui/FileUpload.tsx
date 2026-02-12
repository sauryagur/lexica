/**
 * FileUpload Component
 * Handles file selection and reading for markdown/text documents
 */

"use client";

import { useRef, useState, type ChangeEvent } from "react";

interface FileUploadProps {
  onFileLoad: (content: string, fileName: string) => void;
}

/**
 * FileUpload - File selection and reading component
 * 
 * Features:
 * - Hidden file input (accept=".md,.txt")
 * - Styled button trigger
 * - Reads file as text
 * - Validates file type and size (max 10MB)
 * - Error handling
 * - Loading state
 * - Display file name after upload
 */
export function FileUpload({ onFileLoad }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Reset error
    setError(null);

    // Validate file type
    const validExtensions = [".md", ".txt", ".markdown"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError("Invalid file type. Please upload a .md or .txt file.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Read file
    setIsLoading(true);
    setFileName(file.name);

    try {
      const content = await readFileAsText(file);
      onFileLoad(content, file.name);
      setError(null);
    } catch (err) {
      setError("Failed to read file. Please try again.");
      setFileName(null);
      console.error("File read error:", err);
    } finally {
      setIsLoading(false);
      
      // Reset file input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Read file as text using FileReader
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          reject(new Error("Failed to read file as text"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };
      
      reader.readAsText(file);
    });
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,.markdown"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label="Upload markdown or text file"
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          fontFamily: "var(--font-ui)",
          color: "var(--foreground)",
          backgroundColor: "transparent",
          border: "1px solid var(--ui-border)",
          borderRadius: "0.375rem",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.borderColor = "var(--foreground)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--ui-border)";
        }}
      >
        {isLoading ? "Loading..." : "Upload Document"}
      </button>

      {fileName && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            opacity: 0.7,
            fontFamily: "var(--font-ui)",
          }}
        >
          {fileName}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            color: "#ef4444",
            fontFamily: "var(--font-ui)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
