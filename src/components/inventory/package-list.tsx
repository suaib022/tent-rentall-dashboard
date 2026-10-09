'use client'

import { useState } from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Edit, Trash, Plus, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { savePackage, deleteCatalogItem } from "@/lib/actions/inventory"

export function PackageList({ packages }: { packages: any[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await savePackage({
      id: editing?.id,
      name: fd.get('name'),
      tent_size: fd.get('tent_size'),
      site_space: fd.get('site_space'),
      guest_max: Number(fd.get('guest_max')),
      quantity: Number(fd.get('quantity')),
      includes: fd.get('includes'),
      price_type: fd.get('price_type'),
      price: fd.get('price'),
      image_url: fd.get('image_url')
    })
    setOpen(false)
  }

  function handleAdd() {
    setEditing(null)
    setOpen(true)
  }

  function handleEdit(pkg: any) {
    setEditing(pkg)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-[#d83a2e] hover:bg-[#b02b22]"><Plus className="w-4 h-4 mr-2" /> Add Package</Button>
      </div>
      
      <div className="flex flex-col border-t border-slate-200 divide-y divide-slate-200">
        {packages?.map((pkg, index) => (
          <Dialog key={pkg.id}>
            <div className="relative group">
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors outline-none">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(pkg); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteCatalogItem('packages', pkg.id); }} className="text-red-600"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DialogTrigger render={<div className="flex flex-col md:flex-row items-start md:items-center py-6 gap-6 cursor-pointer hover:bg-slate-50 transition-colors pr-16" />}>
                <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 ml-4">
                  {pkg.image_url ? (
                    <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-[#10253B] mb-1">{pkg.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">Up to {pkg.guest_max} guests • {pkg.tent_size || 'Custom size tent'}</p>
                </div>

                <div className="w-48 shrink-0 flex flex-col hidden md:flex">
                  <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-wider mb-1 block">Tent Included</span>
                  <span className="text-sm font-medium text-[#10253B]">{pkg.tent_size || 'Custom size'}</span>
                </div>

                <div className="w-32 shrink-0 text-right md:pr-4">
                  <span className="font-bold text-[#10253B]">
                    {pkg.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(pkg.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>
              </DialogTrigger>
            </div>

            <DialogContent className="max-w-5xl sm:max-w-5xl p-0 overflow-hidden bg-white">
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50">
                  <div className="w-full h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden shadow-sm">
                    {pkg.image_url && <img src={pkg.image_url} alt={pkg.name} className="w-full h-full object-cover" />}
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 p-6 md:p-8 md:pl-0 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2 text-[#d83a2e] text-[10px] font-bold tracking-widest uppercase">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span>UP TO {pkg.guest_max} GUESTS</span>
                  </div>
                  
                  <h2 className="text-4xl text-[#10253B] font-bold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>{pkg.name}</h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">A complete, comfortable setup for intimate backyard celebrations without more tent than the event needs.</p>
                  
                  <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">TENT INCLUDED</span>
                      <span className="text-sm font-bold text-[#10253B]">{pkg.tent_size || 'Varies'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">SITE SPACE</span>
                      <span className="text-sm font-bold text-[#10253B]">{pkg.site_space || 'Varies'}</span>
                    </div>
                  </div>
                  
                  <div className="py-6 border-t border-slate-200">
                    <h4 className="text-xl font-bold text-[#10253B] mb-4">Package Includes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {pkg.includes?.map((item: string, i: number) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-[#d83a2e] mr-3 shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8 p-4 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">PACKAGE PRICING</span>
                      <span className="text-2xl font-bold text-[#10253B]">
                        {pkg.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(pkg.price_cents / 100).toFixed(2)}`}
                      </span>
                    </div>
                    <Button className="bg-[#d83a2e] hover:bg-[#b02b22] text-white rounded-md px-6">BOOK THIS PACKAGE</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editing?.name} required />
              </div>
              <div className="space-y-2">
                <Label>Guest Capacity</Label>
                <Input name="guest_max" type="number" defaultValue={editing?.guest_max} required />
              </div>
              <div className="space-y-2">
                <Label>Tent Size</Label>
                <Input name="tent_size" defaultValue={editing?.tent_size} required />
              </div>
              <div className="space-y-2">
                <Label>Quantity Available</Label>
                <Input name="quantity" type="number" min="0" defaultValue={editing?.quantity ?? 1} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Site Space</Label>
                <Input name="site_space" defaultValue={editing?.site_space} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Includes (One per line)</Label>
                <Textarea name="includes" defaultValue={editing?.includes?.join('\n')} rows={5} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Image URL (Optional)</Label>
                <Input name="image_url" defaultValue={editing?.image_url} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Price Type</Label>
                <Select name="price_type" defaultValue={editing?.price_type || 'from'}>
                  <SelectTrigger>
                    <SelectValue>
                      {(val: any) => {
                        if (val === 'fixed') return 'Fixed';
                        if (val === 'from') return 'From';
                        if (val === 'custom_quote') return 'Custom Quote';
                        return '';
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="from">From</SelectItem>
                    <SelectItem value="custom_quote">Custom Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editing ? (editing.price_cents / 100).toFixed(2) : ''} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-[#10253B]">Save Package</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
