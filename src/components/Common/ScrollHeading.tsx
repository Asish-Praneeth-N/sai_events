"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

interface ScrollHeadingProps {
  title: string;
  className?: string;
}

export default function ScrollHeading({ title, className }: ScrollHeadingProps) {
  const words = title.split(" ");
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 15 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.65, 
        ease: "easeOut" 
      },
    },
  };

  return (
    <motion.h2
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
      style={{ fontFamily: "Playfair Display, serif" }}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}
