"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface IconPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}
export const IconPicker = forwardRef<HTMLInputElement, IconPickerProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted",
              value && "border-solid"
            )}
          >
            {value ? (
              <img
                src={value}
                alt="Workspace icon"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <PhotoIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Input
              ref={ref}
              type="url"
              placeholder="Enter icon URL or upload"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="mb-2"
              {...props}
            />
            <Button type="button" variant="outline" size="sm" className="w-full">
              Upload Image
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

IconPicker.displayName = "IconPicker"; 