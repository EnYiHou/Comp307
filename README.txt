COMP 307 Project Code Verification
Project: BERK - SOCS Booking Application Regular Project

RUNNING WEBSITE URL
TODO: Add the deployed website URL here.

LOCAL RUN INSTRUCTIONS
1. Run npm install from the repository root.
2. Create server/.env with:
   PORT=3000
   CLIENT_URL=http://localhost:3001
   MONGODB_URI=<MongoDB connection string>
   JWT_SECRET=<JWT secret>
3. Run npm run dev from the repository root.
4. Open http://localhost:3001.

TEAM MEMBERS AND CONTRIBUTIONS
Replace the placeholder rows before submitting.

Name | Student ID | Main Code Contributions
-----|------------|------------------------
TODO Name 1 | TODO ID 1 | TODO: Describe files/features implemented.
TODO Name 2 | TODO ID 2 | TODO: Describe files/features implemented.
TODO Name 3 | TODO ID 3 | TODO: Describe files/features implemented.
TODO Name 4 | TODO ID 4 | TODO: Remove this row if the team has three people.

30% NOT CODED BY THE TEAM
List templates, frameworks, libraries, generated code, and LLM-assisted code here.
Examples already used by the project:
- React, Vite, React Router, Axios, FullCalendar, Express, Mongoose, bcryptjs, jsonwebtoken, cookie-parser, cors, morgan.
- Browser and Node platform APIs.
- TODO: Add any external templates, snippets, generated code, or LLM-assisted sections your team used.

REGULAR PROJECT REQUIREMENT CHECKLIST
- McGill-only registration with owner/user role assignment.
- Landing page and instructions page.
- Owner booking-slot creation, activation, editing, deletion, participant viewing, and mailto contact links.
- Student owner listing, slot booking, appointment dashboard, appointment deletion, and mailto contact links.
- Custom meeting request workflow with owner accept/decline.
- Group meeting calendar poll workflow with invited-user voting and owner finalization.
- Recurring office hours through weekly occurrence creation.
- Invite URLs that direct users to one owner's active public slots after login.
- Database-backed CRUD operations through MongoDB.

NOTES
- Real SMTP email delivery is intentionally not used. The project uses mailto links, which the assignment permits.
- Calendar export is not required for the regular project track and is not implemented.
