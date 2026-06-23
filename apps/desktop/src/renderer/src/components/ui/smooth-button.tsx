import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const smoothButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm ring-offset-background transition-transform duration-150 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-gradient-to-b from-[#FD4B4E] to-destructive text-white shadow-[0px_1px_2px_rgba(0,0,0,0.4),0px_0px_0px_1px_#F61418,inset_0px_0.75px_0px_rgba(255,255,255,0.2)] hover:from-destructive hover:to-destructive",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-white dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-background hover:text-foreground hover:shadow-custom",
        link: "text-primary underline-offset-4 hover:underline",
        candy:
          "border-[0.5px] border-white/25 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md shadow-blue-600/20 hover:from-blue-400 hover:to-blue-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-4 py-2",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type SmoothButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof smoothButtonVariants> & {
    asChild?: boolean;
  };

export const SmoothButton = forwardRef<HTMLButtonElement, SmoothButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(smoothButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
SmoothButton.displayName = "SmoothButton";

// eslint-disable-next-line react-refresh/only-export-components
export { smoothButtonVariants };
