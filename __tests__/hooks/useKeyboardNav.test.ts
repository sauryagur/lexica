/**
 * Tests for useKeyboardNav Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardNav } from "@/app/hooks/useKeyboardNav";

describe("useKeyboardNav", () => {
  beforeEach(() => {
    // Clean up any existing event listeners
    window.removeEventListener("keydown", () => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onAdvance when spacebar is pressed", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Simulate spacebar press
    const event = new KeyboardEvent("keydown", { key: " " });
    window.dispatchEvent(event);

    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onRetreat).not.toHaveBeenCalled();
    expect(onToggleUI).not.toHaveBeenCalled();
  });

  it("calls onAdvance when arrow right is pressed", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Simulate arrow right press
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    window.dispatchEvent(event);

    expect(onAdvance).toHaveBeenCalledTimes(1);
    expect(onRetreat).not.toHaveBeenCalled();
    expect(onToggleUI).not.toHaveBeenCalled();
  });

  it("calls onRetreat when arrow left is pressed", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Simulate arrow left press
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    window.dispatchEvent(event);

    expect(onRetreat).toHaveBeenCalledTimes(1);
    expect(onAdvance).not.toHaveBeenCalled();
    expect(onToggleUI).not.toHaveBeenCalled();
  });

  it("calls onToggleUI when escape is pressed", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Simulate escape press
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(event);

    expect(onToggleUI).toHaveBeenCalledTimes(1);
    expect(onAdvance).not.toHaveBeenCalled();
    expect(onRetreat).not.toHaveBeenCalled();
  });

  it("prevents default browser actions", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Test spacebar
    const spaceEvent = new KeyboardEvent("keydown", { 
      key: " ",
      cancelable: true,
    });
    const spacePreventDefault = vi.spyOn(spaceEvent, "preventDefault");
    window.dispatchEvent(spaceEvent);
    expect(spacePreventDefault).toHaveBeenCalled();

    // Test arrow keys
    const arrowEvent = new KeyboardEvent("keydown", { 
      key: "ArrowRight",
      cancelable: true,
    });
    const arrowPreventDefault = vi.spyOn(arrowEvent, "preventDefault");
    window.dispatchEvent(arrowEvent);
    expect(arrowPreventDefault).toHaveBeenCalled();
  });

  it("does not call handlers when enabled is false", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: false,
      })
    );

    // Try to trigger events
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onAdvance).not.toHaveBeenCalled();
    expect(onRetreat).not.toHaveBeenCalled();
    expect(onToggleUI).not.toHaveBeenCalled();
  });

  it("ignores keyboard events when user is typing in input", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Create an input element and make it the target
    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", { 
      key: " ",
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: input, enumerable: true });
    
    input.dispatchEvent(event);

    expect(onAdvance).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(input);
  });

  it("ignores keyboard events when user is typing in textarea", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Create a textarea element
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const event = new KeyboardEvent("keydown", { 
      key: " ",
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: textarea, enumerable: true });
    
    textarea.dispatchEvent(event);

    expect(onAdvance).not.toHaveBeenCalled();

    // Cleanup
    document.body.removeChild(textarea);
  });

  it("cleans up event listeners on unmount", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Unmount the hook
    unmount();

    // Should have removed the event listener
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("does not respond to other keys", () => {
    const onAdvance = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    renderHook(() =>
      useKeyboardNav({
        onAdvance,
        onRetreat,
        onToggleUI,
        enabled: true,
      })
    );

    // Try various other keys
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));

    expect(onAdvance).not.toHaveBeenCalled();
    expect(onRetreat).not.toHaveBeenCalled();
    expect(onToggleUI).not.toHaveBeenCalled();
  });

  it("updates handlers when callbacks change", () => {
    const onAdvance1 = vi.fn();
    const onAdvance2 = vi.fn();
    const onRetreat = vi.fn();
    const onToggleUI = vi.fn();

    const { rerender } = renderHook(
      ({ onAdvance }) =>
        useKeyboardNav({
          onAdvance,
          onRetreat,
          onToggleUI,
          enabled: true,
        }),
      {
        initialProps: { onAdvance: onAdvance1 },
      }
    );

    // Press spacebar
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onAdvance1).toHaveBeenCalledTimes(1);
    expect(onAdvance2).not.toHaveBeenCalled();

    // Update the callback
    rerender({ onAdvance: onAdvance2 });

    // Press spacebar again
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(onAdvance1).toHaveBeenCalledTimes(1); // Still 1
    expect(onAdvance2).toHaveBeenCalledTimes(1); // Now called
  });
});
