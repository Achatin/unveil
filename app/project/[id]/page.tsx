import { Annotation, Project } from "@prisma/client"
import { DataTable } from "./data-table"
import { columns } from "./columns"

async function fetchProject(id: string): Promise<Project | null> {
  const resProject = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/project/${id}`)
  if (!resProject.ok) {
    console.error("Failed:", await resProject.text())
    return null
  }
  return await resProject.json()
}

async function getAnnotations(): Promise<Annotation[]> {
  const resAnnotations = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/annotation`)
  if (!resAnnotations.ok) {
    console.error("Failed:", await resAnnotations.text())
    return []
  }
  return await resAnnotations.json()
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const project = await fetchProject(id)  
  const annotations: Annotation[] = await getAnnotations();

  if (!project) return <div>Loading...</div>

  return (
    <main className="pt-4 bg-muted">
      <DataTable columns={columns} data={annotations} />
    </main>
  )
}