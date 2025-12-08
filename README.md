# Samanta Portal

A platform for reporting gender-based violence with separate dashboards for victims, police, and lawyers.

## Overview

Samanta Portal was built because survivors of gender-based violence in Nepal often struggle to access safe reporting mechanisms. Filing a complaint can be intimidating, confusing, and time-consuming. This application removes those barriers.

The core idea is straightforward: let survivors choose whether to report to police or a lawyer. The system generates a unique case ID for tracking. Police and lawyers each get their own dashboard. Admins see everything.

We also included an AI assistant for legal questions and dedicated resources for LGBTQIA+ individuals.

## Features

### User Interface

- **Dual Report Channel**: File complaints to either police or lawyer from one form
- **Toggle-Based Switching**: Switch report types with a single click; form updates automatically
- **Glass Morphism Design**: Modern, clean interface with backdrop blur effects
- **Dark/Light Mode**: Theme support across all interfaces
- **Bilingual Support**: English and Nepali interface

### Complaint & Case Management

- **Case ID Generation**: Automatic unique IDs (#SC for police, #SL for lawyer)
- **Advanced Search**: Multi-field search by case ID, complainant name, type, location
- **Status Tracking**: Pending → In Progress → Resolved workflow
- **PDF Export**: Download individual complaints as formatted documents
- **CSV Export**: Bulk export for records and analysis
- **Form Validation**: Input checking with user-friendly error messages

### Role-Based Access

- **Victim Interface**: Report incidents, access rights information, monitor case status
- **Police Dashboard**: View assigned complaints, update status, export records
- **Lawyer Dashboard**: View legal requests, manage cases, export client data
- **Admin Panel**: Unified control center for users, reports, and system oversight
- **Authentication**: Login system with role-based access control

### Support & Resources

- **AI Legal Assistant**: Chatbot for answering rights and legal procedure questions
- **LGBTQIA+ Resources**: Dedicated section with information and support resources
- **Educational Materials**: Downloadable guides and information about rights

### Data Management

- **Multi-Table Database**: Separate storage for users, police reports, lawyer requests
- **Real-Time Updates**: Forms refresh immediately after submission
- **Data Validation**: Server-side and client-side input validation
- **Search Filtering**: Filter by status, type, location, and keywords
- **Statistics Dashboard**: Overview cards showing counts by status

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Application Components](#application-components)
- [User Workflows](#user-workflows)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Database Structure](#database-structure)
- [Screenshots](#screenshots)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## Application Components

### 1. Main Portal (`index.html` + `script.js`)

The entry point for all users. Handles:

- Complaint form with dual-channel toggle (Police/Lawyer)
- Form submission and case ID generation
- AI chatbot integration for legal questions
- Rights information display
- Navigation to other sections

**Key Functions:**

- `generateCaseId(prefix)` - Creates unique case IDs with timestamp
- `setReportTarget(target)` - Switches form between police and lawyer modes
- `showAnswer()` - AI assistant response handling
- `downloadPDF()` - Generates and downloads complaint PDFs

### 2. Admin Dashboard (`admin.html`)

Unified control center for administrators. Includes:

- Home tab with system overview (total users, reports, stats)
- Users tab for user account management
- Reports tab to view all complaints
- Police tab to monitor police cases
- Lawyer tab to monitor lawyer cases
- Global search across all data
- Add, edit, delete functionality for all records

**Admin Capabilities:**

- Add new users
- Edit user information and permissions
- Delete user accounts
- Add lost/found reports directly
- Manage case statuses
- View comprehensive statistics
- Export data

### 3. Police Dashboard (`police.html` + `policedasboard.html`)

Separate interface for police officers. Features:

- Dashboard with stats cards (Total, Pending, In Progress, Resolved)
- Table view of assigned police complaints (#SC prefix)
- Search and filter by ID, name, type, status
- View full complaint details in modal
- Edit case status
- Download complaint PDFs
- Export all reports as CSV

**Police Workflow:**

- See all assigned cases at a glance
- Search for specific complaints
- Click to view full details
- Update status as investigation progresses
- Generate official documents

### 4. Lawyer Dashboard (`lawyer.html` + `lawyerdashboard.html`)

Separate interface for lawyers. Similar to police dashboard but for legal cases:

- Dashboard with stats cards
- Table view of assigned cases (#SL prefix)
- Search and filter functionality
- View complete case details
- Update case progress
- Download case PDFs
- Export client records as CSV

**Lawyer Workflow:**

- Monitor assigned legal cases
- Quick search for specific clients
- Review case details
- Track legal action progress
- Maintain client records

### 5. Rights Information (`LGBTQIA.html`)

Educational resource section featuring:

- LGBTQIA+ rights information
- Support organizations and resources
- Contact information for help services
- Responsive card-based layout
- Theme-aware styling

### 6. Database Layer (`backend/`)

Backend infrastructure:

- `server.js` - Express.js server handling requests
- `auth/google.js` - Google OAuth integration
- `data/email.json` - User data storage
- Connection management and error handling

---

## User Workflows

### Survivor Workflow

1. Visit main portal
2. Read information or access chatbot
3. Click "Report to Police" or "Report to Lawyer"
4. Fill complaint form with incident details
5. Submit (generates unique case ID)
6. Option to download PDF
7. Monitor case progress via email or dashboard

### Police Officer Workflow

1. Log into police dashboard
2. View statistics and assigned complaints
3. Search for specific case
4. Click "View" to read full details
5. Click "Edit" to update status
6. Download individual PDFs or bulk CSV
7. Maintain records of cases handled

### Lawyer Workflow

1. Access lawyer dashboard
2. Check assigned cases and statistics
3. Search for client case by ID or name
4. Review case details
5. Update case status as legal work progresses
6. Export records for billing or filing
7. Maintain client documentation

### Admin Workflow

1. Log into admin panel
2. View system overview on Home tab
3. Switch to Users/Reports/Police/Lawyer tabs as needed
4. Add new records or edit existing ones
5. Monitor trends and statistics
6. Export data for reports

---

## Tech Stack

**Frontend:**

- HTML5 (semantic markup)
- CSS3 (Grid, Flexbox, Glass Morphism)
- Vanilla JavaScript (no frameworks)
- Font Awesome 6.4.0 (icons)
- jsPDF 2.5.1 (PDF generation)
- Google Fonts (Inter, Poppins)

**Backend:**

- Node.js 14+
- Express.js (server)
- Google OAuth (authentication)
- JSON (data storage, file-based)

**Design System:**

- Primary: #0056b3 (Royal Blue)
- Secondary: #1e74d8 (Medium Blue)
- Accent: #10b981 (Emerald)
- Neutral: #f4f7fb (Light Gray-Blue)
- Border Radius: 12-24px

---

## Installation

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/AayuAmor/Samanta_Portal.git
   cd Samanta_Portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure Google OAuth:

   - Create a Google Cloud project
   - Enable OAuth 2.0
   - Update `backend/auth/google.js` with credentials

4. Start the server:

   ```bash
   npm start
   ```

5. Open in browser:
   - Main portal: `http://localhost:3000/Frontend/index.html`
   - Admin panel: `http://localhost:3000/Frontend/admin.html`
   - Police dashboard: `http://localhost:3000/Frontend/police.html`
   - Lawyer dashboard: `http://localhost:3000/Frontend/lawyer.html`

---

## Usage

### For Survivors

1. Go to main portal
2. Fill out complaint form
3. Choose reporting channel (Police or Lawyer)
4. Submit
5. Receive case ID (#SC or #SL)
6. Optionally download PDF

Or:

- Visit LGBTQIA+ section for rights information
- Chat with AI assistant for legal questions

### For Police Officers

1. Log into police dashboard
2. See assigned complaints with status breakdown
3. Search or scroll through cases
4. Click "View" to read details
5. Click "Edit" to update status
6. Download individual PDFs or CSV export

### For Lawyers

1. Access lawyer dashboard
2. View assigned legal cases
3. Search by case ID or client name
4. Review case details
5. Update case status
6. Export client records

### For Admins

1. Log into admin panel
2. View system overview
3. Switch between tabs (Users, Reports, Police, Lawyer)
4. Search across all data
5. Add, edit, or delete records
6. Monitor statistics and trends

---

## Database Structure

### Users Table

```
username | password | full_name | email | phone | user_type
```

### Police Reports Table (#SC prefix)

```
report_id | user_id | complaint_type | description | location | status | created_date
```

### Lawyer Requests Table (#SL prefix)

```
report_id | user_id | complaint_type | description | status | created_date
```

### Case ID Format

| Type             | Prefix | Example          |
| ---------------- | ------ | ---------------- |
| Police Complaint | #SC    | #SC20251208-0001 |
| Lawyer Request   | #SL    | #SL20251208-0001 |

Format: `#[PREFIX][YYYYMMDD]-[XXXX]`

---

## Screenshots

[Placeholder: Add screenshots]

## Main complaint form with toggle

<img width="1847" height="888" alt="image" src="https://github.com/user-attachments/assets/8f4535a0-05d3-40ab-9754-7570730f3967" />
<img width="1842" height="780" alt="image" src="https://github.com/user-attachments/assets/828c3b05-651d-4451-85a4-b0b99a78620e" />
<img width="1853" height="732" alt="image" src="https://github.com/user-attachments/assets/6a2ff970-5d4b-4711-9de3-8f92a59e9ae2" />
<img width="1851" height="596" alt="image" src="https://github.com/user-attachments/assets/c5464105-0d77-40d7-a438-68736d263bdd" />

## Police dashboard with stats

<img width="1858" height="716" alt="image" src="https://github.com/user-attachments/assets/e3e14f65-eb36-4799-97f3-47c9ab18991e" />

## Lawyer dashboard with search

<img width="1882" height="822" alt="image" src="https://github.com/user-attachments/assets/72949060-5492-4e01-8280-3fd6a3a18caf" />

## Admin control panel

<img width="1872" height="781" alt="image" src="https://github.com/user-attachments/assets/c4a024b4-c10c-4a7d-8dda-9ea0364ce261" />

## LGBTQIA+ resources page

<img width="1076" height="887" alt="image" src="https://github.com/user-attachments/assets/c5d8f96c-0e6f-4a3f-9e89-c13a2f07ccc4" />
<img width="1001" height="740" alt="image" src="https://github.com/user-attachments/assets/02d77ff6-4de0-46ab-99fa-fc8dbc551bd0" />


---

## Known Issues

- Data stored in JSON files (not suitable for production)
- No email notifications yet
- Search is case-sensitive in some areas
- PDF exports have basic formatting
- Google OAuth not fully integrated everywhere
- No real-time updates (requires page refresh in some places)
- Limited data validation on forms

---

## Future Improvements

- Switch to PostgreSQL or MongoDB
- Add email/SMS notifications for case updates
- Implement two-factor authentication
- Case reassignment functionality
- Video/audio file uploads for evidence
- Mobile app version
- Real-time case tracking
- Advanced analytics dashboard
- Automated response templates
- More language support (Hindi, Maithili)
- Print-friendly complaint forms
- Digital signature support

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Open a pull request

Keep changes focused. If fixing a bug, reference the issue number.

---

**Built for the 2025 Hackathon**  
***Developed by TEAM KALI*** <br/>
*© 2025 All rights reserved*
