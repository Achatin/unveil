"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Annotation, Project } from "@prisma/client"
import Image from "next/image"

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  useEffect(() => {
    async function load() {
        const resProject = await fetch(`/api/project/${id}`)

        if (!resProject.ok) {
          console.error("Failed:", await resProject.text())
        return
        }

        const data = await resProject.json()
        setProject(data)

        const resAnnotations = await fetch("/api/annotation")

        if (!resAnnotations.ok) {
          console.error("Failed:", await resAnnotations.text())
          return
        }

        const annotationsData = await resAnnotations.json()
        setAnnotations(annotationsData)
    }

    if (id) load()
  }, [id])

  if (!project) return <div>Loading...</div>

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <h2>Annotations</h2>
      <ul>
        {annotations.map((annotation) => (
          <li key={annotation.id}>
            {annotation.label}
            <Image src={annotation.screenshot!} alt="Annotation Screenshot" width={200} height={200} />
        </li>
        ))}
      </ul>
    </div>
  )
}