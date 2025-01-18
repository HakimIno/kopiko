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
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ColorPicker } from "./color-picker";
import { IconPicker } from "./icon-picker";
import { useUpdateWorkspace } from "@/hooks/use-workspace-query";

const workspaceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color"),
  icon: z.string().url("Invalid icon URL").optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

interface EditWorkspaceFormProps {
  workspace: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    theme?: {
      color: string;
    };
  };
  onClose: () => void;
}

export function EditWorkspaceForm({ workspace, onClose }: EditWorkspaceFormProps) {
  const updateWorkspaceMutation = useUpdateWorkspace(workspace.id);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
      color: workspace.theme?.color || "#4F46E5",
      icon: workspace.icon || "",
    },
  });

  async function onSubmit(data: WorkspaceFormValues) {
    try {
      await updateWorkspaceMutation.mutateAsync({
        name: data.name,
        description: data.description,
        theme: {
          color: data.color,
        },
        icon: data.icon,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update workspace:', error);
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
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateWorkspaceMutation.isPending}>
            {updateWorkspaceMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 