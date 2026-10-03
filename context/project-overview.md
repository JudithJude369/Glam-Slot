# Project Overview — GlamSlot

## Purpose
Booking system for salons and barbershops with deposits and WhatsApp reminders.
It fixes two problems: no-shows (lost money) and answering "are you free Friday?" in DMs.
Customers pick a service and slot, pay a small deposit, and get automatic reminders.
Owners get a simple dashboard.
One salon per deployment in v1. Do not add multi-tenant tables or a `tenant_id`.

## Users
- **Customer:** books on a phone, often from a WhatsApp or Instagram link. No account, no password.
- **Owner:** one logged-in user per salon. Manages bookings, services, staff and hours, reminders.

## Pages
Client side:
1. **Landing:** logo, short intro, featured services, address and hours, "Book Now" button.
2. **About:** salon story, team, contact details.
3. **Booking:** service, staff (default "Any available"), date and time, name, WhatsApp number.
4. **Pay deposit:** booking summary, deposit amount, pay button.
5. **Confirmation:** booking details, reschedule and cancel. This is the page the WhatsApp link opens.

Owner side:
6. **Login.**
7. **Calendar:** bookings by day. A drawer to view, cancel or add a booking.
8. **Settings:** tabs for Services, Staff and hours, Reminders.

## Booking lifecycle
- `pending_payment` -> `confirmed` -> `completed`
- `pending_payment` -> `expired` (the 15-minute hold ran out)
- `confirmed` -> `cancelled` (by customer or owner)
- `confirmed` -> `no_show` (owner marks it)
- Rescheduling moves a confirmed booking to a new slot. Its status stays `confirmed`.
- Only `pending_payment` and `confirmed` bookings block a slot.

## Business rules
Deposit:
- Each service has a price and a deposit, both set by the owner in Settings. Default deposit is 30% of the price.
- The deposit counts toward the final bill. The balance is paid at the salon.
- Store all money as integer kobo. Display as ₦ with thousands separators.

Slot hold:
- Starting payment holds the slot for 15 minutes. After that the booking becomes `expired` and the slot is free.
- Payment arrives for an expired booking and the slot is still free: confirm it.
- Payment arrives and the slot was taken: do not confirm. Keep the payment record and flag it for the owner.

Cancel and reschedule:
- More than 24 hours before the appointment: free reschedule, and the deposit carries over to the new slot.
- More than 24 hours before and the customer cancels: booking is cancelled, no automatic refund. The owner sees a "refund due?" flag and handles it manually in the Paystack dashboard.
- Less than 24 hours before, or a no-show: the deposit is forfeited. Reschedule and cancel are blocked.
- The confirmation page must enforce the cutoff on the server, not only in the UI.

Reminders (WhatsApp):
- Send a confirmation right after payment is verified, a reminder 24 hours before, and one 2 hours before.
- The owner can switch each reminder on or off and change the timing in Settings → Reminders.
- Message wording is fixed. WhatsApp requires pre-approved templates, so the owner cannot edit the text.
- Never send reminders for cancelled, expired or completed bookings. Rescheduling recalculates reminder times.

Customer identity:
- No accounts. Each booking has a long random token. The WhatsApp link carries it.
- The link stops working after the appointment time.

Formats:
- Store times in UTC. Show them in Africa/Lagos, 12-hour format (e.g. 2:30 PM).
- WhatsApp numbers must be Nigerian. Accept 0803... or +234803..., store as E.164 (+234803...).

## Out of scope for v1
Customer accounts, automatic refunds, online payment of the balance, multi-branch or multi-salon,
loyalty points, reviews, SMS fallback, multiple languages.

## Defaults to confirm with the client
Treat these as the working rule until the owner says otherwise:
- Slot interval: 30 minutes. Minimum notice: 2 hours. Booking window: 60 days ahead.
- Owner-added bookings (walk-ins, phone calls) skip the deposit and are marked `source = owner`.
- No limit on the number of reschedules.
- Cancelling more than 24 hours ahead gets a manual refund decision, not an automatic one.
