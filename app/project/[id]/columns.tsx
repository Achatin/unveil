"use client"

import { Annotation } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Annotation>[] = [
  {
    accessorKey: "screenshot",
    header: "Screenshot",
    cell: ({ getValue }) => {
      const screenshot = getValue() as string | null
      return screenshot ? (
        <img src={screenshot} alt="Annotation Screenshot" className="w-20" />
      ) : (
        "No Screenshot"
      )
    },
  },
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "location",
    header: "Location",
  },

]