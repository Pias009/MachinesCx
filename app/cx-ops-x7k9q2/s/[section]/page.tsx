"use client";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import AdminShell from "../../AdminShell";
import Editor from "../../Editor";
import { schemaBySlug } from "@/lib/cmsSchemas";

export default function SectionPage({ params }: { params: { section: string } }) {
  const schema = schemaBySlug(params.section);
  if (!schema) notFound();

  return (
    <AdminShell>
      <Suspense fallback={<div className="adm-skel" style={{ height: 260, borderRadius: 16 }} />}>
        <Editor key={schema.slug} schema={schema} />
      </Suspense>
    </AdminShell>
  );
}
