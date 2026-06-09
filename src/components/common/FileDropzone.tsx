import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  onFile,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMb = 5,
}: {
  onFile: (file: File) => void;
  accept?: string;
  maxSizeMb?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handle(file: File) {
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Max ${maxSizeMb}MB`);
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-sm transition-colors",
        dragOver && "border-primary bg-accent",
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
    >
      <Upload className="mb-2 size-6 text-muted-foreground" />
      <p>Drop a photo or click to upload</p>
      <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · max {maxSizeMb}MB</p>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}