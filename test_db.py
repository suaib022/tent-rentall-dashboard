import os
import requests

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

# 1. Fetch bookings
r = requests.get(f"{url}/rest/v1/bookings?select=*", headers=headers)
bookings = r.json()
print("BOOKINGS:")
for b in bookings:
    if b.get('status') == 'confirmed':
        print(f"ID: {b.get('id')}, Pkg: {b.get('package_id')}, Tent: {b.get('tent_id')}, Type: {b.get('booking_type')}")

# 2. Fetch packages
r = requests.get(f"{url}/rest/v1/packages?select=id,name,tent_style_id", headers=headers)
pkgs = r.json()
print("\nPACKAGES:")
for p in pkgs:
    print(f"ID: {p.get('id')}, Name: {p.get('name')}, TentStyleID: {p.get('tent_style_id')}")

