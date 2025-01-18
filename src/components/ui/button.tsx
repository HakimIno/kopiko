import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#D69D78] text-[#F6F5EE] hover:bg-[#D69D78]/90",
        destructive:
          "bg-[#D8510D] text-[#D8510D]]-foreground shadow-sm hover:bg-[#D8510D]/90",
        outline:
          "border border-[#D69D78] bg-[#D69D78]/20 text-[#D69D78] shadow-sm hover:bg-[#D69D78]/10",
        secondary:
          "bg-[#FFFFFF] text-[#D69D78] shadow-sm hover:bg-[#FFFFFF]/80 border-[0.5px] border-[#D69D78]",
        ghost:
          "text-[#D69D78] hover:bg-[#D69D78]/10",
        link:
          "text-[#D69D78] underline-offset-4 hover:underline",
        muted:
          "bg-muted text-muted-foreground hover:bg-muted/80",
        tertiary:
          "bg-[#F6F5EE]/50 text-[#D69D78] shadow-sm hover:bg-[#F6F5EE]/30",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 wf",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }