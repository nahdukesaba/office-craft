import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/common/FileDropzone";

export function CameraCapture({
  onFile,
  maxSizeMb = 5,
}: {
  onFile: (file: File) => void;
  maxSizeMb?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!env.proofCameraOnly) {
    return <FileDropzone onFile={onFile} maxSizeMb={maxSizeMb} />;
  }

  function handle(file: File) {
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Max ${maxSizeMb}MB`);
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm">
      <Camera className="size-6 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">
        Photos must be captured live from the device camera.
      </p>
      <Button
        type="button"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1 size-4" />
        Open camera
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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