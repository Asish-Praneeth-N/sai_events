import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "../page";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  }),
}));

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock framer-motion
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
    useScroll: () => ({ scrollYProgress: { on: vi.fn(), get: vi.fn(() => 0) } }),
    useSpring: (val: any) => val,
    useTransform: (val: any, from: any, to: any) => to[0],
    useReducedMotion: () => false,
    useMotionValue: (init: any) => ({
      get: () => init,
      set: vi.fn(),
      on: vi.fn(() => () => {}),
      onChange: vi.fn(() => () => {}),
    }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe("Home Page", () => {
  it("renders the main page experience", () => {
    render(<Home />);
    
    // Check if the page experience is rendering (the brand title is present in DOM)
    expect(screen.getByText("SAI EVENTS")).toBeInTheDocument();
  });
});
