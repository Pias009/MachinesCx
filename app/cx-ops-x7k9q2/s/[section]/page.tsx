"use client";
import { notFound } from "next/navigation";
import AdminShell from "../../AdminShell";
import Editor from "../../Editor";
import { schemaBySlug } from "@/lib/cmsSchemas";

export default function SectionPage({ params }: { params: { section: string } }) {
  const schema = schemaBySlug(params.section);
  if (!schema) notFound();

  return (
    <AdminShell>
      <Editor key={schema.slug} schema={schema} />
    </AdminShell>
  );
}
