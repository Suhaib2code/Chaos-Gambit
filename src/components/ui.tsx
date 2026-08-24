import React from "react";
import { cn } from "../lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'ghost'|'outline' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50",
          "h-10 px-4 py-2",
          variant === 'default' && "bg-purple-600 text-white hover:bg-purple-500 shadow-md",
          variant === 'ghost' && "hover:bg-gray-800 text-gray-300 hover:text-white",
          variant === 'outline' && "border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
