

## Plan: Replace "BOOK NOW" with "CHECK AVAILABLE TICKETS" Booking Dashboard

### Overview
Replace the current "BOOK NOW" WhatsApp link in the NumberBoard with a "CHECK AVAILABLE TICKETS" button that opens an overlay booking dashboard matching the screenshot reference. The dashboard shows a grid of player ticket numbers, color-coded by booking status, with selection and WhatsApp booking.

### Changes

**1. Create `src/components/BookingDashboard.tsx`**
- Full-screen overlay/modal with green background, matching the screenshot style
- Header: "Booking dashboard" with X close button
- "Your name" text input field
- Grid of cells (6 columns) showing all player ticket numbers from the `players` data
- Cell colors: **Yellow** = booked (`is_booked: true`), **White** = available (`is_booked: false`)
- Clicking an available (white) cell toggles selection (turns blue with checkmark)
- Booked cells are not selectable
- Red "BOOK NOW" button at bottom
- On submit: validates name + at least one selection, opens WhatsApp link with message: `Hi! I am {name} and I want to book these tickets [{selected numbers}] for your upcoming tambola game`
- Responsive: fits within viewport on mobile (390px width from current viewport)

**2. Edit `src/components/NumberBoard.tsx`**
- Replace the `<a href="wa.me/...">BOOK NOW</a>` with a button labeled "CHECK AVAILABLE TICKETS"
- On click, set state to show the BookingDashboard overlay
- Pass `players` data as a prop (needs to receive it from parent)

**3. Edit `src/pages/Index.tsx`**
- Pass `players` prop to `<NumberBoard>` component so it has access to player booking data

### Grid Logic
- Each player has a display_order number. The grid shows cells numbered by player index (1, 2, 3... up to players.length)
- Map each cell to a player: cell N → player at index N-1
- Show player's ticket number or display_order as the cell number
- Color based on `player.is_booked`

### Styling (matching screenshot)
- Container: bright green background, yellow/gold border
- Header: dark green with white text
- Cells: yellow (booked) / white (available) / blue (selected), pink/magenta borders
- BOOK NOW button: red, full width

