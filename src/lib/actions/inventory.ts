'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

export async function deleteCatalogItem(table: string, id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/tents')
  revalidatePath('/packages')
  revalidatePath('/accessories')
}

export async function saveTent(data: any) {
  const supabase = await createClient()
  const payload = { ...data, price_cents: Math.round(parseFloat(data.price || 0) * 100) }
  delete payload.price
  if (!payload.id) payload.slug = generateSlug(payload.name)

  if (payload.id) {
    const { error } = await supabase.from('tent_styles').update(payload).eq('id', payload.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('tent_styles').insert(payload)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/tents')
  revalidatePath('/packages')
  revalidatePath('/accessories')
}

export async function savePackage(data: any) {
  const supabase = await createClient()
  const payload = { 
    ...data, 
    price_cents: Math.round(parseFloat(data.price || 0) * 100),
    includes: typeof data.includes === 'string' ? data.includes.split('\n').filter(Boolean) : data.includes
  }
  delete payload.price
  if (!payload.id) payload.slug = generateSlug(payload.name)

  if (payload.id) {
    const { error } = await supabase.from('packages').update(payload).eq('id', payload.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('packages').insert(payload)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/tents')
  revalidatePath('/packages')
  revalidatePath('/accessories')
}

export async function saveAccessory(data: any) {
  const supabase = await createClient()
  const payload = { ...data, price_cents: Math.round(parseFloat(data.price || 0) * 100) }
  delete payload.price
  if (!payload.id) payload.slug = generateSlug(payload.name)

  if (payload.id) {
    const { error } = await supabase.from('accessories').update(payload).eq('id', payload.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('accessories').insert(payload)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/tents')
  revalidatePath('/packages')
  revalidatePath('/accessories')
}

export async function getInventoryCounts() {
  const supabase = await createClient()
  const [{ data: tents }, { data: packages }, { data: accessories }] = await Promise.all([
    supabase.from('tent_styles').select('id, name, quantity, image_url, price_cents'),
    supabase.from('packages').select('id, name, quantity, image_url, tent_size'),
    supabase.from('accessories').select('id, name, quantity, image_url')
  ])
  return { tents: tents || [], packages: packages || [], accessories: accessories || [] }
}
