"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getChangeRequests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('change_requests')
    .select(`
      *,
      bookings (
        reference,
        event_date,
        start_date,
        end_date,
        package_id,
        tent_id,
        packages ( name, image_url, guest_max, price_cents, price_type, tent_size ),
        tent_styles ( name, image_url, price_cents, price_type )
      ),
      customers (
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateChangeRequestStatus(id: string, status: 'open' | 'approved' | 'rejected') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('change_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/change-requests')
}

export async function createChangeRequest(payload: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('change_requests')
    .insert([{
      booking_id: payload.booking_id,
      customer_id: payload.customer_id || null,
      source: 'manual',
      change_type: payload.change_type,
      requested_changes: payload.requested_changes || {},
      customer_note: payload.customer_note || null,
      status: 'open'
    }])

  if (error) throw new Error(error.message)
  revalidatePath('/change-requests')
}
