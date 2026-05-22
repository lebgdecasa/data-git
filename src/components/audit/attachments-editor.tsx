"use client";

import { useRef, useState } from "react";
import { Link2, Trash2, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuditAttachment } from "@/lib/types";

export function AttachmentsEditor({
  auditId,
  userId,
  attachments,
  onChange,
}: {
  auditId: string;
  userId: string;
  attachments: AuditAttachment[];
  onChange: (next: AuditAttachment[]) => void;
}) {
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addLink() {
    if (!linkUrl.trim()) return;
    onChange([
      ...attachments,
      {
        id: crypto.randomUUID(),
        type: "link",
        label: linkLabel.trim() || linkUrl,
        value: linkUrl.trim(),
      },
    ]);
    setLinkLabel("");
    setLinkUrl("");
  }

  function remove(id: string) {
    onChange(attachments.filter((a) => a.id !== id));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${userId}/${auditId}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("audit-uploads")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      onChange([
        ...attachments,
        {
          id: crypto.randomUUID(),
          type: "screenshot",
          label: file.name,
          value: path,
        },
      ]);
      toast.success("Screenshot uploaded");
    } catch (err) {
      toast.error("Upload failed", {
        description:
          err instanceof Error
            ? err.message
            : "Check that Supabase storage is configured.",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="link-label">Label</Label>
          <Input
            id="link-label"
            placeholder="Pricing page"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="link-url">Link</Label>
          <Input
            id="link-url"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={addLink}>
            <Link2 className="h-4 w-4" />
            Add link
          </Button>
        </div>
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload screenshot
        </Button>
      </div>

      {attachments.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                {a.type === "link" ? (
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate font-medium">{a.label}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove attachment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
