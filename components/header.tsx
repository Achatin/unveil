'use client'

import { FC } from 'react'
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Header: FC = () => {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className='w-full h-12 mt-1 border-b border-t border-border flex items-center px-8 space-x-4 sticky top-0 bg-background z-10 shadow'>
      <div className='flex items-center gap-2 border-r border-border pr-4 h-full'>
        <h1 className='font-bold text-xl tracking-wider'>Unveil</h1>
      </div>

      <Breadcrumb>
        <BreadcrumbList>

          {/* Root */}
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Projects</BreadcrumbLink>
          </BreadcrumbItem>

          {segments.length > 0 && <BreadcrumbSeparator />}

          {/* Dynamic segments */}
          {segments
            .filter((segment) => segment !== "project")
            .map((segment, index, filteredSegments) => {
                const href = '/' + segments.slice(0, segments.indexOf(segment) + 1).join('/')
                const isLast = index === filteredSegments.length - 1

                let label = segment

                return (
                <span key={href} className="flex items-center">
                    <BreadcrumbItem>
                    {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                    )}
                    </BreadcrumbItem>

                    {!isLast && <BreadcrumbSeparator />}
                </span>
                )
            })}

        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default Header