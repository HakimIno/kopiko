"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";
import { useWorkspaceDialog } from "@/stores/use-workspace-dialog";
import { fetchWithAuth } from "@/lib/auth";

const workspaceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color"),
  icon: z.string().url("Invalid icon URL").optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export function WorkspaceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { onClose } = useWorkspaceDialog();

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#4F46E5", // Default indigo color
      icon: "",
    },
  });

  async function onSubmit(data: WorkspaceFormValues) {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          icon: data.icon,
          theme: {
            color: data.color,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      const workspace = await response.json();
      
      toast.success("Workspace created successfully!");
      router.refresh();
      onClose();
      router.push(`/workspace/${workspace.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Workspace" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your workspace&apos;s visible name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your workspace..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your workspace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-72 space-y-4">
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Color</FormLabel>
                  <FormControl>
                    <ColorPicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 