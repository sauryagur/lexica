/**
 * ImageDisplay Component
 * Displays images in the reading flow with centered layout
 */

"use client";

import { useState } from "react";
import type { ImageNode } from "@/app/types";

export interface ImageDisplayProps {
  image: ImageNode;
}

/**
 * ImageDisplay - Center-aligned image display for reading flow
 * 
 * Features:
 * - Replaces word lane when on image node
 * - Center-aligned with max dimensions (80vw, 80vh)
 * - Alt text fallback on error
 * - Smooth transition
 * - Pure black background
 */
export function ImageDisplay({ image }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      className="image-display"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "80vw",
        maxHeight: "80vh",
        width: "100%",
        height: "100%",
        transition: "opacity 0.2s ease-in-out",
        opacity: imageLoaded ? 1 : 0,
      }}
    >
      {imageError ? (
        // Alt text fallback
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            color: "var(--foreground)",
            fontFamily: "var(--font-ui)",
            maxWidth: "600px",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          >
            🖼️
          </div>
          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          >
            Image unavailable
          </div>
          {image.alt && (
            <div
              style={{
                fontSize: "0.875rem",
                opacity: 0.7,
                fontStyle: "italic",
              }}
            >
              {image.alt}
            </div>
          )}
          <div
            style={{
              fontSize: "0.75rem",
              opacity: 0.5,
              marginTop: "1rem",
              wordBreak: "break-all",
            }}
          >
            {image.src}
          </div>
        </div>
      ) : (
        <>
          {/* Image */}
          <img
            src={image.src}
            alt={image.alt || "Document image"}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              display: "block",
              borderRadius: "0.25rem",
            }}
          />
          
          {/* Alt text caption (optional, shown below image if available) */}
          {image.alt && imageLoaded && (
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.875rem",
                color: "var(--foreground)",
                opacity: 0.6,
                textAlign: "center",
                fontFamily: "var(--font-ui)",
                fontStyle: "italic",
                maxWidth: "80%",
              }}
            >
              {image.alt}
            </div>
          )}
        </>
      )}
    </div>
  );
}
