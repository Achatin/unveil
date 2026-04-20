"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FolderPlus } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
})

export function CreateProjectDialog() {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Creating project:", value)

      await fetch("http://localhost:3000/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      })

      toast.success("Project created")
    },
  })

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger>
        <Button variant="default" className="px-4"><FolderPlus /> Create Project</Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            A project will store all your annotations as a dataset.
          </DialogDescription>
        </DialogHeader>

        {/* FORM (single form only) */}
        <form
          id="create-project-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            {/* Name */}
            <form.Field name="name">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Project Name</FieldLabel>
                    <Input
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value)
                      }
                      onBlur={field.handleBlur}
                      placeholder="UX Audit - Shopify Checkout"
                    />
                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>

            {/* DESCRIPTION */}
            <form.Field name="description">
              {(field) => {
                const invalid =
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid

                return (
                  <Field data-invalid={invalid}>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value)
                      }
                      onBlur={field.handleBlur}
                      placeholder="Dataset for analyzing checkout UX issues..."
                      rows={4}
                    />
                    <FieldDescription>
                      Optional but useful for context.
                    </FieldDescription>
                    {invalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>
        </form>

        {/* FOOTER */}
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            type="submit"
            form="create-project-form"
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}