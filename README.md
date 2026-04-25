# BERK - COMP 307 Booking App

BERK is a MERN-style booking application for the COMP 307 regular SOCS Booking
Application Project. It supports McGill-only registration, owner-managed
availability, student appointment booking, custom meeting requests, group
meeting polls, recurring office hours, invite links, and the McGill Tinder team
finder bonus feature.

## Run Locally

1. Install dependencies from the repo root:

   ```bash
   npm install
   ```

2. Create `server/.env`:

   ```env
   PORT=3000
   CLIENT_URL=http://localhost:3001
   MONGODB_URI=<your MongoDB connection string>
   JWT_SECRET=<your JWT secret>
   ```

3. Start both apps:

   ```bash
   npm run dev
   ```

The frontend runs on `http://localhost:3001` and the backend runs on
`http://localhost:3000`.

## Main Features

- McGill-only registration: `@mcgill.ca` users become owners, and
  `@mail.mcgill.ca` users become regular users.
- Owners can create private/public booking slots, activate slots, edit slots,
  delete slots, view participants, and contact booked students with `mailto:`.
- Students can browse owners with active public slots, book appointments,
  manage appointments, cancel bookings, and contact owners with `mailto:`.
- Users can request custom meetings; owners can accept or decline requests.
- Owners can create group meeting polls using candidate calendar times, and
  invited users can vote from their dashboard.
- Owners can create recurring office hours by selecting weekly occurrence
  counts.
- Owners can generate invite URLs that show only that owner's active public
  slots after login.
- McGill Tinder lets users create, join, leave, delete, and manage project team
  requests.

## Useful Commands

```bash
npm run lint -w client
npm run build
npm run seed:random
```

## Notes For Grading

The required submission metadata template is in `README.txt`. Fill in the
running deployment URL, teammate table, and contribution details before
submitting to myCourses.
