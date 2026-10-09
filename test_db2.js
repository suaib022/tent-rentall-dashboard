const fs = require('fs');
async function run() {
  const env = fs.readFileSync('.env.local', 'utf8').split('\n');
  let url = '', key = '';
  for (const line of env) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1];
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1];
  }
  const headers = { 'apikey': key, 'Authorization': `Bearer ${key}` };
  const res = await fetch(`${url}/rest/v1/packages?select=id,name,tent_style_id,image_url`, { headers });
  const pkgs = await res.json();
  console.log(pkgs);
}
run();
