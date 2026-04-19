/*
  Warnings:

  - You are about to drop the column `screenshotUrl` on the `Annotation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "selector" TEXT,
    "text" TEXT,
    "screenshot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Annotation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Annotation" ("createdAt", "description", "height", "id", "label", "location", "projectId", "selector", "text", "title", "url", "width", "x", "y") SELECT "createdAt", "description", "height", "id", "label", "location", "projectId", "selector", "text", "title", "url", "width", "x", "y" FROM "Annotation";
DROP TABLE "Annotation";
ALTER TABLE "new_Annotation" RENAME TO "Annotation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
