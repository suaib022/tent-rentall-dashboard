'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      packages ( name, image_url, guest_max, price_cents, price_type, tent_size ),
      tent_styles ( name, image_url, price_cents, price_type )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function getApprovedBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      packages ( name, image_url, guest_max, price_cents, price_type, tent_size ),
      tent_styles ( name, image_url, price_cents, price_type )
    `)
    .in('status', ['confirmed', 'completed'])
    .order('start_date', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/bookings')
  revalidatePath('/schedule')
  revalidatePath('/availability')
}

export async function createBooking(data: any) {
  const supabase = await createClient()
  
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    event_date: data.event_date || data.start_date,
    venue_address: data.venue_address,
    guest_count: data.guest_count,
    package_id: data.package_id,
    tent_id: data.tent_id,
    booking_type: data.booking_type || 'event',
    addon_accessories_ids: data.addon_accessories_ids,
    payment_status: data.payment_status || 'unpaid',
    start_date: data.start_date,
    end_date: data.end_date,
    status: 'pending_approval'
  }
  
  const { error } = await supabase.from('bookings').insert(payload)
  if (error) throw new Error(error.message)
  
  revalidatePath('/bookings')
  revalidatePath('/schedule')
  revalidatePath('/availability')
}
