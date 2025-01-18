"use client";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { forwardRef } from "react";

const presetColors = [
  "#4F46E5", // Indigo
  "#0EA5E9", // Sky
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Orange
];

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full h-10 rounded-md border border-input flex items-center gap-2 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              className
            )}
          >
            <div
              className="w-6 h-6 rounded-full border"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  value === color && "ring-2 ring-ring ring-offset-2"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange?.(color)}
              />
            ))}
          </div>
          <div className="mt-4">
            <input
              ref={ref}
              type="color"
              className="w-full h-10"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              {...props}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

ColorPicker.displayName = "ColorPicker"; 