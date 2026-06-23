"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type AccordionItem = {
  id: string | number;
  title: string;
  content: React.ReactNode;
};

export type SmoothAccordionProps = {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  defaultExpandedIds?: Array<string | number>;
};

export function SmoothAccordion({
  items,
  allowMultiple = false,
  className = "",
  defaultExpandedIds = [],
}: SmoothAccordionProps) {
  const [expandedItems, setExpandedItems] =
    useState<Array<string | number>>(defaultExpandedIds);
  const shouldReduceMotion = useReducedMotion();

  const toggleItem = (id: string | number) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter((item) => item !== id));
    } else if (allowMultiple) {
      setExpandedItems([...expandedItems, id]);
    } else {
      setExpandedItems([id]);
    }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {items.map((item) => {
        const isExpanded = expandedItems.includes(item.id);

        return (
          <div
            className="overflow-hidden rounded-lg bg-neutral-50"
            key={item.id}
          >
            <button
              aria-controls={`accordion-content-${item.id}`}
              aria-expanded={isExpanded}
              className="flex min-h-[44px] w-full items-center justify-between gap-2 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
              id={`accordion-header-${item.id}`}
              onClick={() => toggleItem(item.id)}
              type="button"
            >
              <h3 className="font-system text-base font-normal">
                {item.title}
              </h3>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                className="shrink-0 text-muted-foreground"
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              >
                <Icon name="expand_more" size={20} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? { height: "auto", opacity: 1 }
                      : {
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: {
                              type: "spring",
                              stiffness: 500,
                              damping: 40,
                              duration: 0.25,
                            },
                            opacity: { duration: 0.2 },
                          },
                        }
                  }
                  aria-labelledby={`accordion-header-${item.id}`}
                  className="overflow-hidden"
                  exit={
                    shouldReduceMotion
                      ? { height: 0, opacity: 0, transition: { duration: 0 } }
                      : {
                          height: 0,
                          opacity: 0,
                          transition: {
                            height: { duration: 0.2 },
                            opacity: { duration: 0.15 },
                          },
                        }
                  }
                  id={`accordion-content-${item.id}`}
                  initial={
                    shouldReduceMotion
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  role="region"
                >
                  <div className="p-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
