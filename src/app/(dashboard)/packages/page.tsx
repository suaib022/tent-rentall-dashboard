export const instant = false;

import { createClient } from "@/lib/supabase/server";
import { PackageList } from "@/components/inventory/package-list";

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase.from('packages').select('*').order('created_at');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground mb-1">Catalog</h2>
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Packages</h1>
      </div>
      <PackageList packages={packages || []} />
    </div>
  )
}
