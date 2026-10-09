export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { AccessoryList } from "@/components/inventory/accessory-list";

export default async function AccessoriesPage() {
  const supabase = await createClient();
  const { data: accessories } = await supabase.from('accessories').select('*').order('created_at');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Catalog</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Accessories</h1>
      </div>
      <AccessoryList accessories={accessories || []} />
    </div>
  )
}
