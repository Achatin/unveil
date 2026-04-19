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
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-background sm:items-start">
      <h1>Welcome 👋</h1>
      {projects.length > 0 && (
        <div className="w-full">
          <h2 className="text-2xl mb-4">Projects</h2>
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

      <CreateProjectDialog />
    </main>
  );
}
