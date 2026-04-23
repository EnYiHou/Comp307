# COMP 307 Booking App

This repository now has a booking-app skeleton for a MERN-style project with:

- `client/`: React + Vite frontend with booking-oriented routes and placeholder pages
- `server/`: Express + MongoDB backend with auth scaffolding, domain models, and feature routes

## Run locally

1. Install dependencies from the repo root with `npm install`
2. Copy [server/.env.example](/Users/enyi/Documents/McGill/Comp307/Comp307/server/.env.example) to `server/.env` and fill in values if needed
3. Start both apps with `npm run dev`

Frontend runs on `http://localhost:3001`

Backend runs on `http://localhost:3000`

## What is scaffolded

- Public pages for landing, auth, instructions, and owner browsing
- Student and owner dashboard route structure
- Auth context and API service on the client
- Auth routes and McGill email validation logic on the server
- Core scheduling models: users, slots, bookings, requests, invite links, group meetings, and recurring series
- Placeholder feature routes so the API can grow cleanly by domain
