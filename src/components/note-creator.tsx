"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MultiSelect } from "@/components/ui/multi-select"

const formSchema = z.object({
  name: z.string().min(1, { message: "标题不能为空" }).max(200),
  tags: z.array(z.string()).default([]),
}).required()

interface NoteCreatorProps {
  paperId?: string;
  availableTags: Array<{ id: string, name: string }>;
  redirectToNote?: boolean;
  onNoteCreated?: () => void;
}

export const NoteCreator = ({ paperId, availableTags, redirectToNote = false, onNoteCreated }: NoteCreatorProps) => {
  const router = useRouter();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tags: []
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          tagIds: values.tags,
          paperIds: paperId ? [paperId] : []
        }),
      });

      if (!response.ok) {
        throw new Error("创建笔记失败");
      }

      const note = await response.json();
      toast.success("笔记创建成功");
      if (redirectToNote) {
        router.push(`/notes/${note.id}`);
      } else {
        onNoteCreated?.();
      }
      setIsNoteDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建笔记失败");
      console.error("Create note error:", error);
    }
  };

  return (
    <Dialog
      open={isNoteDialogOpen}
      onOpenChange={(isOpen) => {
        setIsNoteDialogOpen(isOpen)
        form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          添加笔记
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-2">创建新笔记</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>标签</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={availableTags}
                      selected={field.value}
                      onChange={field.onChange}
                      onCreateOption={async (inputValue) => {
                        const tempId = `temp_${Date.now()}`;
                        const newTag = { id: tempId, name: inputValue };
                        field.onChange([...field.value, tempId]);
                      }}
                      placeholder="选择或创建标签"
                    />
                  </FormControl>
                  <FormDescription>
                    选择已有标签或输入新标签名称创建
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                variant="secondary"
                size="sm"
              >
                创建
              </Button>
              <Button
                onClick={() => setIsNoteDialogOpen(false)}
                variant="ghost"
                size="sm"
              >
                取消
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 