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
import { MoreVertical, Edit, Trash, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { saveTent, deleteCatalogItem } from "@/lib/actions/inventory"

export function TentList({ tents }: { tents: any[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await saveTent({
      id: editing?.id,
      name: fd.get('name'),
      description: fd.get('description'),
      price_type: fd.get('price_type'),
      price: fd.get('price'),
      quantity: Number(fd.get('quantity')),
      sizes: fd.get('sizes'),
      guest_min: Number(fd.get('guest_min')),
      guest_max: Number(fd.get('guest_max')),
      best_for: fd.get('best_for'),
      image_url: fd.get('image_url')
    })
    setOpen(false)
  }

  function handleAdd() {
    setEditing(null)
    setOpen(true)
  }

  function handleEdit(tent: any) {
    setEditing(tent)
    setOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-[#d83a2e] hover:bg-[#b02b22]"><Plus className="w-4 h-4 mr-2" /> Add Tent Style</Button>
      </div>
      
      <div className="flex flex-col border-t border-slate-200 divide-y divide-slate-200">
        {tents?.map(tent => (
          <Dialog key={tent.id}>
            <div className="relative group">
              <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors outline-none">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(tent); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteCatalogItem('tent_styles', tent.id); }} className="text-red-600"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <DialogTrigger render={<div className="flex flex-col md:flex-row items-start md:items-center py-6 gap-6 cursor-pointer hover:bg-slate-50 transition-colors pr-16" />}>
                <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 ml-4">
                  {tent.image_url ? (
                    <img src={tent.image_url} alt={tent.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-[#10253B] mb-1">{tent.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{tent.description}</p>
                </div>

                <div className="w-48 shrink-0 flex flex-col hidden md:flex">
                  <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-wider mb-1 block">Available Sizes</span>
                  <span className="text-sm font-medium text-[#10253B]">{tent.sizes}</span>
                </div>

                <div className="w-32 shrink-0 text-right md:pr-4">
                  <span className="font-bold text-[#10253B]">
                    {tent.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(tent.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>
              </DialogTrigger>
            </div>

            <DialogContent className="max-w-5xl sm:max-w-5xl p-0 overflow-hidden bg-white">
              <div className="flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50">
                  <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl overflow-hidden shadow-sm">
                    {tent.image_url && <img src={tent.image_url} alt={tent.name} className="w-full h-full object-cover" />}
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 p-6 md:p-8 md:pl-0 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-2 block">
                    UP TO {tent.guest_max}{tent.guest_max_plus ? '+' : ''} GUESTS
                  </span>
                  <h2 className="text-4xl text-[#10253B] font-bold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>{tent.name}</h2>
                  <p className="text-lg text-slate-600 mb-8">{tent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-200 mb-8">
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">AVAILABLE SIZES</span>
                      <span className="text-sm font-bold text-[#10253B]">{tent.sizes}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">BEST FOR</span>
                      <span className="text-sm font-bold text-[#10253B]">{tent.best_for}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">TENT PRICING</span>
                      <span className="text-2xl font-bold text-[#10253B]">
                        {tent.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(tent.price_cents / 100).toFixed(2)}`}
                      </span>
                    </div>
                    <Button className="bg-[#d83a2e] hover:bg-[#b02b22] text-white rounded-md px-6">Book This Tent</Button>
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
            <DialogTitle>{editing ? 'Edit Tent Style' : 'Add Tent Style'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Name</Label>
                <Input name="name" defaultValue={editing?.name} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editing?.description} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Sizes</Label>
                <Input name="sizes" defaultValue={editing?.sizes} required placeholder="e.g. 20x20 to 40x100" />
              </div>
              <div className="space-y-2">
                <Label>Guest Min</Label>
                <Input name="guest_min" type="number" defaultValue={editing?.guest_min} required />
              </div>
              <div className="space-y-2">
                <Label>Guest Max</Label>
                <Input name="guest_max" type="number" defaultValue={editing?.guest_max} required />
              </div>
              <div className="space-y-2">
                <Label>Quantity Available</Label>
                <Input name="quantity" type="number" min="0" defaultValue={editing?.quantity ?? 1} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Best For</Label>
                <Input name="best_for" defaultValue={editing?.best_for} required />
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
              <Button type="submit" className="bg-[#10253B]">Save Tent Style</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
