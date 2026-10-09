export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { TentList } from "@/components/inventory/tent-list";

export default async function TentsPage() {
  const supabase = await createClient();
  const { data: tents } = await supabase.from('tent_styles').select('*').order('created_at');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Catalog</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Tent Styles</h1>
      </div>
      <TentList tents={tents || []} />
    </div>
  )
}
