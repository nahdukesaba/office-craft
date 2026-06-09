import type { Proof } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";

export function ProofGallery({ proofs }: { proofs: Proof[] }) {
  if (proofs.length === 0) {
    return <EmptyState title="No proofs yet" description="Photos uploaded for this booking will appear here." />;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {proofs.map((p) => (
        <figure key={p.id} className="overflow-hidden rounded-lg border border-border">
          <img src={p.url} alt={`${p.kind} proof`} className="aspect-square w-full object-cover" />
          <figcaption className="bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">{p.kind}</figcaption>
        </figure>
      ))}
    </div>
  );
}