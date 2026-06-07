"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const smoothEase = [0.22, 1, 0.36, 1] as const;

type RevealOptions = {
  amount?: number;
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  id?: string;
  y?: number;
};

function getRevealState(shouldReduceMotion: boolean, y: number) {
  return shouldReduceMotion
    ? { initial: false, whileInView: undefined }
    : {
        initial: { opacity: 0, y },
        whileInView: { opacity: 1, y: 0 },
      };
}

export function Reveal({
  amount = 0.2,
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 24,
}: RevealOptions) {
  const shouldReduceMotion = useReducedMotion();
  const state = getRevealState(Boolean(shouldReduceMotion), y);

  return (
    <motion.div
      className={className}
      initial={state.initial}
      whileInView={state.whileInView}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({
  amount = 0.18,
  children,
  className,
  delay = 0,
  duration = 0.65,
  id,
  y = 28,
}: RevealOptions) {
  const shouldReduceMotion = useReducedMotion();
  const state = getRevealState(Boolean(shouldReduceMotion), y);

  return (
    <motion.section
      id={id}
      className={className}
      initial={state.initial}
      whileInView={state.whileInView}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: smoothEase }}
    >
      {children}
    </motion.section>
  );
}

export function Stagger({
  amount = 0.18,
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: RevealOptions & { stagger?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "show"}
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={
        shouldReduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: smoothEase },
              },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({
  amount = 0.18,
  children,
  className,
  delay = 0,
  stagger = 0.08,
}: RevealOptions & { stagger?: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.ul
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "show"}
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.ul>
  );
}

export function StaggerListItem({
  children,
  className,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      className={className}
      variants={
        shouldReduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: smoothEase },
              },
            }
      }
    >
      {children}
    </motion.li>
  );
}

export function Floating({
  children,
  className,
  delay = 0,
  duration = 4,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
