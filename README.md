# LUMEN Frontend

A streamlined activity management platform that reduces friction in event sign-ups for individuals and caregivers, while minimizing manual effort for staff in managing registrations.

## Problem Statement

> How might we reduce friction in activity sign-ups for both individuals and caregivers, while reducing manual effort for staff in managing and consolidating registration data?

## Features

- **Easy Event Registration** - One-click sign-up for participants and volunteers
- **Calendar View** - Visual schedule of all available activities
- **Daily Reminders** - Automatic notifications for upcoming registered events
- **Multi-language Support** - Accessible for diverse users
- **Role-based Access** - Separate views for participants, volunteers, and admins

## Tech Stack

- React 19
- React Router
- Tailwind CSS
- Lucide Icons

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LUMEN-FE
   ```

2. **Clone the backend repository**
   
   This frontend requires the backend server to be running. Clone and set up the backend:
   ```bash
   git clone https://github.com/p1922389-JunWei/Lumen-BE
   cd Lumen-BE
   ```
   Follow the setup instructions in the [Lumen-BE repository](https://github.com/p1922389-JunWei/Lumen-BE).

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file in the root directory if needed:

```env
REACT_APP_API_URL=http://localhost:3001
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Project Structure

```
src/
├── components/     # React components
├── context/        # Auth & Language contexts
├── lib/            # Utility functions
├── locales/        # Translation files
└── App.js          # Main application
```
