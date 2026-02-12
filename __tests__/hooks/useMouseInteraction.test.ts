/**
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
 * Tests for useMouseInteraction Hook
 */

import { renderHook, act } from "@testing-library/react";
import { useMouseInteraction } from "@/app/hooks/useMouseInteraction";

describe("useMouseInteraction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls onInteraction when mouse moves", () => {
    const mockOnInteraction = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
      })
    );
    
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
  });

  it("calls onIdle after timeout with no movement", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
        idleTimeout: 3000,
      })
    );
    
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
    expect(mockOnIdle).not.toHaveBeenCalled();
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockOnIdle).toHaveBeenCalledTimes(1);
  });

  it("resets idle timer on subsequent mouse movement", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
        idleTimeout: 3000,
      })
    );
    
    // First movement
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    // Wait 2 seconds (not enough to trigger idle)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Second movement resets timer
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    // Wait another 2 seconds (total 4 seconds, but timer was reset)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // onIdle should not have been called yet
    expect(mockOnIdle).not.toHaveBeenCalled();
    
    // Wait final 1 second to complete 3 seconds from last movement
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(mockOnIdle).toHaveBeenCalledTimes(1);
  });

  it("does not call onInteraction multiple times for continuous movement", () => {
    const mockOnInteraction = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
      })
    );
    
    // First movement
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
    
    // Second movement (should not trigger onInteraction again)
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
  });

  it("calls onInteraction again after idle timeout", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
        idleTimeout: 3000,
      })
    );
    
    // First interaction
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
    
    // Wait for idle timeout
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockOnIdle).toHaveBeenCalledTimes(1);
    
    // Move again after idle
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(2);
  });

  it("does not track when enabled is false", () => {
    const mockOnInteraction = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        enabled: false,
      })
    );
    
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).not.toHaveBeenCalled();
  });

  it("uses default timeout of 3000ms when not specified", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
      })
    );
    
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    // Wait default 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockOnIdle).toHaveBeenCalledTimes(1);
  });

  it("cleans up event listener on unmount", () => {
    const mockOnInteraction = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    
    const { unmount } = renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
      })
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );
  });

  it("returns reset function that clears state", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    const { result } = renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
        idleTimeout: 3000,
      })
    );
    
    // Trigger interaction
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    expect(mockOnInteraction).toHaveBeenCalledTimes(1);
    
    // Reset
    act(() => {
      result.current.reset();
    });
    
    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // onIdle should not be called since we reset
    expect(mockOnIdle).not.toHaveBeenCalled();
  });

  it("handles custom idle timeout", () => {
    const mockOnInteraction = vi.fn();
    const mockOnIdle = vi.fn();
    
    renderHook(() =>
      useMouseInteraction({
        onInteraction: mockOnInteraction,
        onIdle: mockOnIdle,
        idleTimeout: 5000,
      })
    );
    
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    
    // Wait 3000ms (should not trigger idle)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(mockOnIdle).not.toHaveBeenCalled();
    
    // Wait another 2000ms (total 5000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(mockOnIdle).toHaveBeenCalledTimes(1);
  });
});
