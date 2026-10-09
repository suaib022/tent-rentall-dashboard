const fs = require('fs');

async function run() {
  // read .env.local
  const env = fs.readFileSync('.env.local', 'utf8').split('\n');
  let url = '';
  let key = '';
  for (const line of env) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1];
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1];
  }
  
  const headers = { 'apikey': key, 'Authorization': `Bearer ${key}` };
  
  let res = await fetch(`${url}/rest/v1/bookings?select=*`, { headers });
  let bookings = await res.json();
  console.log("BOOKINGS:");
  for (const b of bookings) {
    if (b.status === 'confirmed') {
      console.log(`ID: ${b.id}, Pkg: ${b.package_id}, Tent: ${b.tent_id}, Type: ${b.booking_type}, EventDate: ${b.event_date}`);
    }
  }

  res = await fetch(`${url}/rest/v1/packages?select=id,name,tent_style_id`, { headers });
  let pkgs = await res.json();
  console.log("\nPACKAGES:");
  for (const p of pkgs) {
    console.log(`ID: ${p.id}, Name: ${p.name}, TentStyleID: ${p.tent_style_id}`);
  }
}
run();
