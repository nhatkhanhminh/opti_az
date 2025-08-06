import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const rainbowButtonVariants = cva(
  "group relative inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))] bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))] dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
  {
    variants: {
      size: {
        sm: "h-9 px-4 py-1.5 text-sm",
        default: "h-11 px-8 py-2",
        lg: "h-12 px-10 py-2.5 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants> {}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <button
        className={cn(rainbowButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

RainbowButton.displayName = "RainbowButton";

export { RainbowButton, rainbowButtonVariants };
