"use client";

import { CreateProjectDialog } from "@/components/ui/forms/createProject";
import { Project } from "@prisma/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProjects = async () => {
    const res = await fetch("/api/project");
    const data = await res.json();

    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  
  return (
    <main className="w-full max-w-3xl flex-col items-center justify-between bg-background py-12 px-8">
      <div className="mb-8">
        <h1 className="font-semibold text-2xl mb-2">Welcome 👋</h1>
        <p className="text-muted-foreground">This is your project dashboard.</p>
      </div>
      {projects.length > 0 && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl">Projects</h2>
            <CreateProjectDialog />
          </div>
          <ul className="space-y-4">
            {projects.map((p) => (
              <li key={p.id} className="p-4 border rounded">
                <a href={`/project/${p.id}`} className="text-blue-500">
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
