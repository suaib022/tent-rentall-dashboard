import re

with open("src/components/bookings/booking-list.tsx", "r") as f:
    text = f.read()

# 1. Add confirmAction state
state_insertion = """  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', id: string } | null>(null)"""
text = text.replace("  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)", state_insertion)

# 2. Change buttons in renderBookingCard to trigger confirmation
old_buttons = """                  <Button onClick={() => handleApprove(booking.id)} className="bg-green-600 hover:bg-green-700 w-full">
                    Approve
                  </Button>
                  <Button onClick={() => handleReject(booking.id)} variant="destructive" className="w-full">
                    Reject
                  </Button>"""
new_buttons = """                  <Button onClick={() => setConfirmAction({ type: 'approve', id: booking.id })} className="bg-green-600 hover:bg-green-700 w-full">
                    Approve
                  </Button>
                  <Button onClick={() => setConfirmAction({ type: 'reject', id: booking.id })} variant="destructive" className="w-full">
                    Reject
                  </Button>"""
text = text.replace(old_buttons, new_buttons)

# 3. Add Dialog right before {/* Details Modal */}
confirm_dialog = """      {/* Confirmation Modal */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && !isLoading && setConfirmAction(null)}>
        <DialogContent className="max-w-sm p-6 text-center border-0 shadow-lg bg-white">
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${confirmAction?.type === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {confirmAction?.type === 'approve' ? <CheckIcon className="w-8 h-8" strokeWidth={3} /> : <div className="text-4xl font-bold">!</div>}
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-[#10253B]">
              {confirmAction?.type === 'approve' ? 'Approve Booking?' : 'Reject Booking?'}
            </DialogTitle>
            <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
              {confirmAction?.type === 'approve' 
                ? 'Are you sure you want to approve this booking? This will reserve the inventory for these dates.' 
                : 'Are you sure you want to reject this booking? The customer will not receive the items.'}
            </p>
            <div className="flex gap-3 w-full mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmAction(null)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                className={`flex-1 ${confirmAction?.type === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                disabled={isLoading}
                onClick={async () => {
                  if (!confirmAction) return
                  setIsLoading(true)
                  try {
                    if (confirmAction.type === 'approve') await handleApprove(confirmAction.id)
                    else await handleReject(confirmAction.id)
                    setConfirmAction(null)
                  } catch (e) {
                    console.error(e)
                  } finally {
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}"""

text = text.replace("      {/* Details Modal */}", confirm_dialog)

with open("src/components/bookings/booking-list.tsx", "w") as f:
    f.write(text)

