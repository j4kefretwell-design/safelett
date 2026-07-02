"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
}

export function ScrollRevealGroup({
  children,
  className = "",
  staggerMs = 100,
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children).filter(Boolean);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""}`}
          style={{ transitionDelay: `${index * staggerMs}ms` }}
        >
          {child as ReactElement}
        </div>
      ))}
    </div>
  );
}
