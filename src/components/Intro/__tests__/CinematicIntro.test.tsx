import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CinematicIntro from "../CinematicIntro";

// Mock framer-motion animations
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("CinematicIntro Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the brand title and invitation text", () => {
    const onOpening = vi.fn();
    const onComplete = vi.fn();

    render(<CinematicIntro onOpening={onOpening} onComplete={onComplete} />);

    expect(screen.getByText("SAI EVENTS")).toBeInTheDocument();
    expect(screen.getByText("Welcome.")).toBeInTheDocument();
    expect(screen.getByText("You're invited to experience extraordinary celebrations.")).toBeInTheDocument();
    expect(screen.getByText("Crafting memories that last forever.")).toBeInTheDocument();
  });

  it("triggers onOpening after 3.7 seconds (3.0s reading + 0.7s tilt)", () => {
    const onOpening = vi.fn();
    const onComplete = vi.fn();

    render(<CinematicIntro onOpening={onOpening} onComplete={onComplete} />);

    expect(onOpening).not.toHaveBeenCalled();

    // Step 1: Advance by 3000ms to trigger the transition from reveal to tilt
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Step 2: Advance by 700ms to trigger the tilt transition and call onOpening
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(onOpening).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("triggers onComplete after 4.5 seconds total (3.7s tilt release + 0.8s drop)", () => {
    const onOpening = vi.fn();
    const onComplete = vi.fn();

    render(<CinematicIntro onOpening={onOpening} onComplete={onComplete} />);

    // Step 1: Advance by 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Step 2: Advance by 700ms (triggers onOpening)
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(onComplete).not.toHaveBeenCalled();

    // Step 3: Advance by 800ms (triggers onComplete)
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
