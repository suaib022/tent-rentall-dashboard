with open("src/components/bookings/booking-list.tsx", "r") as f:
    content = f.read()

# find "const renderBookingCard"
idx = content.find("  const renderBookingCard = (booking: any) => (")
end_idx = content.find("  )", idx) + 3

card_func = content[idx:end_idx]

# remove it from where it is
new_content = content[:idx] + content[end_idx:]

# insert it before return (
ret_idx = new_content.find("  return (")
new_content = new_content[:ret_idx] + card_func + "\n\n" + new_content[ret_idx:]

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(new_content)
