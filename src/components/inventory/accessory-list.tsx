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
import { saveAccessory, deleteCatalogItem } from "@/lib/actions/inventory"

export function AccessoryList({ accessories }: { accessories: any[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await saveAccessory({
      id: editing?.id,
      name: fd.get('name'),
      category: fd.get('category'),
      description: fd.get('description'),
      price_type: fd.get('price_type'),
      price: fd.get('price'),
      quantity: Number(fd.get('quantity')),
      image_url: fd.get('image_url')
    })
    setOpen(false)
  }

  function handleAdd() {
    setEditing(null)
    setOpen(true)
  }

  function handleEdit(acc: any) {
    setEditing(acc)
    setOpen(true)
  }

  const categorySubtitles: Record<string, string> = {
    'Weather Essentials': 'COMFORT & PROTECTION',
    'Lighting & Flooring': 'ATMOSPHERE & FOUNDATION',
    'Furniture & Event Essentials': 'SEATING & DETAILS',
    'Entertainment Add-Ons': 'FUN & MEMORIES'
  }

  const groupedAccessories = accessories?.reduce((acc: any, curr: any) => {
    if (!acc[curr.category]) acc[curr.category] = []
    acc[curr.category].push(curr)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-[#d83a2e] hover:bg-[#b02b22]"><Plus className="w-4 h-4 mr-2" /> Add Accessory</Button>
      </div>
      <div className="space-y-16">
        {Object.entries(groupedAccessories).map(([category, items]: [string, any]) => (
          <div key={category}>
            <div className="mb-6">
              <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest block mb-1">
                {categorySubtitles[category] || 'ACCESSORIES'}
              </span>
              <h2 className="text-3xl font-bold text-[#10253B]" style={{ fontFamily: "Manrope, sans-serif" }}>{category}</h2>
            </div>
            
            <div className="flex flex-col border-t border-slate-200 divide-y divide-slate-200">
              {items.map((acc: any) => (
                <Dialog key={acc.id}>
                  <div className="relative group">
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 transition-colors outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(acc); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteCatalogItem('accessories', acc.id); }} className="text-red-600"><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <DialogTrigger render={<div className="flex flex-col md:flex-row items-start md:items-center py-6 gap-6 cursor-pointer hover:bg-slate-50 transition-colors pr-16" />}>
                      <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200 ml-4">
                        {acc.image_url ? (
                          <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-[#10253B] mb-1">{acc.name}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{acc.description}</p>
                      </div>

                      <div className="w-48 shrink-0 flex flex-col hidden md:flex">
                        <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-wider mb-1 block">Category</span>
                        <span className="text-sm font-medium text-[#10253B]">{acc.category}</span>
                      </div>

                      <div className="w-32 shrink-0 text-right md:pr-4">
                        <span className="font-bold text-[#10253B]">
                          {acc.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(acc.price_cents / 100).toFixed(2)}`}
                        </span>
                      </div>
                    </DialogTrigger>
                  </div>

                  <DialogContent className="max-w-5xl sm:max-w-5xl p-0 overflow-hidden bg-white">
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50">
                        <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl overflow-hidden shadow-sm">
                          {acc.image_url && <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover" />}
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/2 p-6 md:p-8 md:pl-0 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-2 block">
                          {categorySubtitles[category] || 'ACCESSORIES'}
                        </span>
                        <h2 className="text-4xl text-[#10253B] font-bold mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>{acc.name}</h2>
                        <p className="text-lg text-slate-600 mb-8">{acc.description}</p>
                        
                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-200 mb-8">
                          <div>
                            <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">CATEGORY</span>
                            <span className="text-sm font-bold text-[#10253B]">{acc.category}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[10px] font-bold text-[#d83a2e] uppercase tracking-widest mb-1 block">STARTING PRICE</span>
                            <span className="text-2xl font-bold text-[#10253B]">
                              {acc.price_type === 'custom_quote' ? 'Custom Quote' : `From $${(acc.price_cents / 100).toFixed(2)}`}
                            </span>
                          </div>
                          <Button className="bg-[#d83a2e] hover:bg-[#b02b22] text-white rounded-md px-6">Book This Item</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Accessory' : 'Add Accessory'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" defaultValue={editing?.category} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editing?.description} required />
            </div>
            <div className="space-y-2">
              <Label>Image URL (Optional)</Label>
              <Input name="image_url" defaultValue={editing?.image_url} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Quantity Available</Label>
                <Input name="quantity" type="number" min="0" defaultValue={editing?.quantity ?? 1} required />
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
              <Button type="submit" className="bg-[#10253B]">Save Accessory</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
