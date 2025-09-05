import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import JoinCategoryModal from "@/components/join-category-modal"

export default function PrivateCategoryCTA({ categoryId, categoryName }: { categoryId: string; categoryName?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <div className="mt-0.5"><Lock className="w-4 h-4 text-amber-600" /></div>
      <div className="flex-1">
        <div className="font-medium text-amber-900">This category is private</div>
        <div className="text-sm text-amber-800">Join to view threads and participate.</div>
      </div>
      <Button size="sm" onClick={() => setOpen(true)}>Join</Button>
      <JoinCategoryModal isOpen={open} onClose={() => setOpen(false)} categoryId={categoryId} categoryName={categoryName} />
    </div>
  )
}
