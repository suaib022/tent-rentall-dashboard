import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function main() {
  const { data, error } = await supabase.from('bookings').select('*').limit(1)
  console.log('Error:', error)
  console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data, columns unknown')
  
  if (!data || data.length === 0) {
    // try to insert an empty row to get the schema error
    const { error: insertError } = await supabase.from('bookings').insert({ id: '00000000-0000-0000-0000-000000000000' })
    console.log('Insert Error:', insertError)
  }
}

main()
