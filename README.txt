COMP 307 Project Contribution Summary

Website URL:
https://winter2026-comp307-group26.cs.mcgill.ca/

Demo Accounts:


Owner:
    Username: sophie.chen@mcgill.ca
    Password: SeedPass123!

User:
    Username: alex.kim@mail.mcgill.ca
    Password: SeedPass123!






================ WORK DISTRIBUTION ================


Bogdan Timercan — 261166331 ================


Booking Slot and Group Poll Creation

    Owner form for booking slot and group poll creation
    Support for configuring booking title, description, visibility, capacity, recurrence and inviting users
    Interactive calendar for selecting available times
    Group poll creation with exact candidate time slots
    Additional heatmap option for group polls using date ranges
    Backend API to support all booking creation types
    Mongoose schemas for storing normal bookings and group booking polls

Invite Component on User Dashboard

    Added group polls to the dashboard of invited users
    Interactive calendar-based voting interface for preferred times, with vote count indicators
    Support for voting on both exact candidate slots and heatmap-style availability blocks
    Automatic vote saving, allowing users to update votes at any time
    Backend API for retrieving user invites and updating votes

Owner Poll Management

    Added created polls component to the dashboard of owners
    Interactive calendar-based interface for finalizing time selection
    Displayed vote counts for both group poll methods
    Heatmap visualization to show vote intensity across available time blocks
    Delete poll feature
    Backend API for retrieving owner polls, finalizing decisions, deleting polls

Search Features

    Backend API functionality for search features involving users and owners

AI Usage

    I used AI to speed up the CSS design work. The initial layout and general direction was created manually, and then AI was used to refine the styling and achieve a more polished look. Overall, about 65% of my CSS is AI generated.








Kevin Xu — 261224849 ================



User Dashboard

    Built the main student dashboard view where users can see their upcoming appointments and meeting requests
    API calls to load the student’s booked appointments and submitted meeting requests from the backend
    Added different features for the user dashboard such as delete appointments or cancel requests
    Added loading, empty, and error states so the dashboard gives clear feedback to user during usage

Owner Dashboard

    Built the main owner dashboard view where owners can manage student meeting requests and bookings
    Displayed pending student requests with corresponding informations such as requester name
    Added decline/accept pending request feature
    Added different functionalities to make the interface more robust such as confirmation steps before declining requests or deleting bookings, etc.
    Connected the owner dashboard to the owner polls section

Confirmation Dialog

    Created user friendly confirmation component that ask for user confirmation before important action
    Added confirmation hook for reusability so pages can request confirmation before important actions
    Example usages include deleting bookings or appointments, etc.

AI Usage

    Used AI for debugging/bugfixes and refining of the css files for a more esthetic look. Without counting debugging. The css and polishing is approximately 60% generated.









EnYi Hou — 261165635 ================


Authentication & Authorization

    Implemented a complete Authentication System: login, signup, context management
    Built Backend Authentication: controllers, services, and routes
    Utilized Protected Routes for role-based access control

UI Layout & Components

    Developed core application layouts: Dashboard Shell, Header, Footer, and Public Shell
    Fixed bugs with ConfirmationDialog component for modal confirmations

Data & Backend

    Implemented Meeting Request System
    Created a centralized API Layer
    Configured Database and Environment settings

Core Functionality

    Built an Owner Directory with search, grid display, and profile pages

Application Structure

    Set up comprehensive Application Routing and Navigation
    Created dedicated Authentication Pages with login and signup forms

AI Usage

    Core functionalities were implemented manually. AI was used to improve some user experience features, assist with parts of the coding logic, and generate approximately 50% of the CSS.








Ronald Zhang — 261168569 ================


Worked On

    Worked on the McGill Tinder bonus feature
    Minor bugfix in authMiddleware.js
    Worked on bugfixes to get our app to run on the provided McGill server, minor in line count
    Updated UI for slot creation at the behest of the TA so that the UI isn’t horribly compressed
    Prevented booking from being made in the past, TA feedback
    Added input limits for every text field, TA feedback, technically 0 line contribution

AI Usage

    AI usage was fairly minimal: I used it to do the regex to limit what course codes could be input into. Line count contribution was maybe 3 lines.
    Used AI to fix our server failing to run on the provided backend. By line count, the contribution here was less than 30 lines even if AI was used extensively during the debugging process.
    Used AI for React bugfixes, but this did not contribute to the line count as I did not use it to generate code.

