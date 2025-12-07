# Samanta Portal

A platform for reporting gender-based violence with separate dashboards for victims, police, and lawyers.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Samanta Portal was built to make it easier for survivors of gender-based violence to file complaints. In Nepal, accessing legal help can be difficult and intimidating. This platform removes some of that friction.

The core idea is simple: let survivors choose whether they want to report to police or a lawyer. Each report gets a unique case ID. Police and lawyers get their own dashboards to track and update cases. Admins can see everything.

The platform includes an AI assistant for basic legal questions and information about rights. We also added resources specifically for LGBTQIA+ individuals.

## Features

- File complaints to either police or lawyer (user's choice)
- Unique case IDs generated for each report (#SC for police, #SL for lawyer)
- Separate dashboards for police officers and lawyers
- Admin dashboard to view and manage all reports
- AI chatbot for legal guidance and rights information
- Download complaints as PDF
- Export reports as CSV
- LGBTQIA+ rights information and resources
- Bilingual interface (English and Nepali)

## Tech Stack

**Frontend:**

- HTML5, CSS3, JavaScript (no frameworks)
- Glass morphism design with CSS Grid
- Font Awesome 6.4.0 for icons
- jsPDF 2.5.1 for PDF generation
- Google Fonts (Inter, Poppins)

**Backend:**

- Node.js with Express.js
- Google OAuth for authentication
- JSON for data storage (currently file-based)

**Deployment:**

- Can run on any server that supports Node.js
- Frontend files are static and can be served separately

## Installation

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- A modern web browser

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/AayuAmor/Samanta_Portal.git
   cd Samanta_Portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional) Set up Google OAuth:

   - Create a Google Cloud project
   - Add OAuth credentials
   - Update `backend/auth/google.js` with your client ID and secret

4. Start the server:

   ```bash
   npm start
   ```

5. Open in your browser:

   ```
   http://localhost:3000/Frontend/index.html
   ```

   Other URLs:

   - Admin dashboard: `http://localhost:3000/Frontend/admin.html`
   - Police dashboard: `http://localhost:3000/Frontend/police.html`
   - Lawyer dashboard: `http://localhost:3000/Frontend/lawyer.html`

## Usage

### For Survivors

1. Go to the main portal
2. Click "File a Complaint"
3. Choose: Report to Police or Report to Lawyer
4. Fill out the form with your details and incident information
5. Submit
6. Get a case ID (looks like #SC20251207-0001 or #SL20251207-0001)
7. Download your complaint as PDF if needed

You can also:

- Read about your rights in the LGBTQIA+ section
- Chat with the AI assistant for legal questions

### For Police Officers

1. Log into the police dashboard
2. See all police complaints assigned to you
3. Search by case ID, name, or complaint type
4. Click "View" to see full details
5. Click "Edit" to change the case status (Pending → In Progress → Resolved)
6. Download reports as CSV for your records

### For Lawyers

1. Log into the lawyer dashboard
2. See all legal requests assigned to you
3. Search by case ID, name, or issue type
4. Click "View" to see full case details
5. Click "Edit" to update case status
6. Download cases as CSV

### For Admins

1. Log into the admin dashboard
2. See overview of all users and reports
3. Switch between tabs: Home, Users, Reports, Police, Lawyer
4. Add, edit, or delete records as needed
5. Search across any field
6. Export data as CSV

## Screenshots

[Placeholder: Add screenshots of main portal, dashboards, and key features]

- Main complaint form
- Police dashboard
- Lawyer dashboard
- Admin overview

## Known Issues

- Data is stored in JSON files, not a database (fine for testing, not production-ready)
- No email notifications yet (planned)
- Search is case-sensitive in some areas (should be case-insensitive everywhere)
- PDF exports have basic formatting (could be improved)
- Google OAuth not fully integrated in all dashboards

## Future Improvements

- Switch from JSON to a proper database (PostgreSQL or MongoDB)
- Add email and SMS notifications when cases are updated
- Implement case reassignment (admins reassign to different officers/lawyers)
- Video and audio file upload for evidence
- More languages (Hindi, Maithili, etc.)
- Mobile app
- Real-time case tracking with notifications
- Better search (full-text, filters, sorting)
- Automated email templates for common responses
- Two-factor authentication for dashboards

## Contributing

1. Fork the repo
2. Create a branch for your feature: `git checkout -b feature/your-feature`
3. Make your changes
4. Test locally
5. Commit: `git commit -m "Add your feature"`
6. Push: `git push origin feature/your-feature`
7. Open a pull request

Keep changes focused on one thing at a time. If you're fixing a bug, mention which issue it closes.

## License

MIT License. See LICENSE file for details.

---

Built for the 2025 Hackathon. Maintained by the Samanta Portal team.
