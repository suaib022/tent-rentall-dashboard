import re

with open("src/components/schedule/availability-view.tsx", "r") as f:
    text = f.read()

# Replace Search with a Select component for filtering
old_search_ui = """      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="search"
            placeholder="Search packages and tents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">"""

new_search_ui = """      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <select 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          >
            <option value="">All Packages & Tents</option>
            <optgroup label="Packages">
              {inventory.packages.map((p: any) => (
                <option key={`pkg_${p.id}`} value={`pkg_${p.id}`}>{p.name}</option>
              ))}
            </optgroup>
            <optgroup label="Tents">
              {inventory.tents.map((t: any) => (
                <option key={`tent_${t.id}`} value={`tent_${t.id}`}>{t.name}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="relative w-full md:w-64">"""

text = text.replace(old_search_ui, new_search_ui)

# Update filtering logic to use the new select values
old_filter_logic = """  const filteredPackages = inventory.packages.filter((pkg: any) => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredTents = inventory.tents.filter((tent: any) => 
    tent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )"""

new_filter_logic = """  const filteredPackages = inventory.packages.filter((pkg: any) => {
    if (!searchQuery) return true;
    return searchQuery === `pkg_${pkg.id}`;
  })
  
  const filteredTents = inventory.tents.filter((tent: any) => {
    if (!searchQuery) return true;
    return searchQuery === `tent_${tent.id}`;
  })"""

text = text.replace(old_filter_logic, new_filter_logic)

# Update package rendering to include image
old_pkg_render = """                      return (
                        <div key={pkg.id} className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 truncate mr-2" title={pkg.name}>{pkg.name}</span>
                          <span className={`font-mono font-bold ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{pkg.quantity}
                          </span>
                        </div>
                      )"""

new_pkg_render = """                      return (
                        <div key={pkg.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            {pkg.image_url ? (
                              <img src={pkg.image_url} alt={pkg.name} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 shrink-0 flex items-center justify-center text-[8px] text-slate-400">No img</div>
                            )}
                            <span className="text-slate-700 font-medium truncate text-sm" title={pkg.name}>{pkg.name}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{pkg.quantity}
                          </span>
                        </div>
                      )"""

text = text.replace(old_pkg_render, new_pkg_render)

# Update tent rendering to include image
old_tent_render = """                      return (
                        <div key={tent.id} className="flex justify-between items-center py-0.5">
                          <span className="text-slate-600 truncate mr-2" title={tent.name}>{tent.name}</span>
                          <span className={`font-mono font-bold ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{tent.quantity}
                          </span>
                        </div>
                      )"""

new_tent_render = """                      return (
                        <div key={tent.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            {tent.image_url ? (
                              <img src={tent.image_url} alt={tent.name} className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-slate-100 shrink-0 flex items-center justify-center text-[8px] text-slate-400">No img</div>
                            )}
                            <span className="text-slate-700 font-medium truncate text-sm" title={tent.name}>{tent.name}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${available <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {available}/{tent.quantity}
                          </span>
                        </div>
                      )"""

text = text.replace(old_tent_render, new_tent_render)

with open("src/components/schedule/availability-view.tsx", "w") as f:
    f.write(text)

