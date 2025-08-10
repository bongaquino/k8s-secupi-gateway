import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  animated = false,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  animated?: boolean;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-gray-200 relative h-3 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <style>
        {animated &&
          `
          @keyframes progress-shine {
            to {
              left: calc(100% - 2rem);
            }
          }
        `}
      </style>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-blue-500 h-full w-full rounded-full flex-1 transition-all relative",
          animated && "overflow-hidden"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {animated && (
          <div
            className="absolute left-0 w-8 h-full bg-white/20 blur-[3px] -skew-x-12"
            style={{ animation: "progress-shine 1.25s ease-in-out infinite" }}
          />
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
