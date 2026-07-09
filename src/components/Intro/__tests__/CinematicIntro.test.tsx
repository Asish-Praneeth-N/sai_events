import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CinematicDoors from "../CinematicDoors";

// Mock framer-motion animations
vi.mock("framer-motion", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (target, key) => {
          const Component = React.forwardRef(({ children, ...props }: any, ref: any) => {
            const cleanProps = { ...props };
            delete cleanProps.transition;
            delete cleanProps.variants;
            delete cleanProps.initial;
            delete cleanProps.animate;
            delete cleanProps.exit;
            delete cleanProps.whileHover;
            delete cleanProps.whileTap;
            delete cleanProps.viewport;
            const Tag = key as any;
            return <Tag ref={ref} {...cleanProps}>{children}</Tag>;
          });
          Component.displayName = `motion.${String(key)}`;
          return Component;
        },
      }
    ),
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
