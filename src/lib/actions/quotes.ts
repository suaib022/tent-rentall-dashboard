"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getQuotes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quote_requests')
    .select(`
      *,
      packages ( name, image_url, guest_max, price_cents, price_type, tent_size ),
      tent_styles ( name, image_url, price_cents, price_type )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateQuoteStatus(id: string, status: 'new' | 'sent' | 'accepted' | 'declined') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('quote_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/quotes')
}

export async function createQuote(payload: any) {
  const supabase = await createClient()

  // Find or create customer
  let customer_id = null
  if (payload.email) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', payload.email)
      .single()
      
    if (existingCustomer) {
      customer_id = existingCustomer.id
    } else {
      const { data: newCustomer, error: custError } = await supabase
        .from('customers')
        .insert([{
          name: payload.name,
          email: payload.email,
          phone: payload.phone
        }])
        .select('id')
        .single()
        
      if (!custError && newCustomer) {
        customer_id = newCustomer.id
      }
    }
  }

  const { error } = await supabase
    .from('quote_requests')
    .insert([{
      customer_id,
      source: 'manual',
      status: 'new',
      event_date: payload.event_date,
      guest_count: payload.guest_count,
      venue_address: payload.venue_address,
      package_id: payload.package_id || null,
      tent_style_id: payload.tent_style_id || null,
      message: payload.message || null
    }])

  if (error) throw new Error(error.message)
  revalidatePath('/quotes')
}
