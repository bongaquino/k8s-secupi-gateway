import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-sm border  bg-background px-3 py-2 text-base ring-offset-background placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ",
        className
      )}
      ref={ref}
      {...props}
      draggable
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
