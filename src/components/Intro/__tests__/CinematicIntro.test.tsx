import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CinematicDoors from "../CinematicDoors";

// Mock framer-motion animations
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("CinematicDoors Component", () => {
  it("renders without crashing", () => {
    const onOpening = vi.fn();
    const onComplete = vi.fn();

    render(<CinematicDoors onOpening={onOpening} onComplete={onComplete} />);
    expect(screen.queryByText("SAI EVENTS")).toBeDefined();
  });
});
