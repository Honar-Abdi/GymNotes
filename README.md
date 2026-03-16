# GymNotes

Personal gym tracking and analytics application for logging workouts and visualizing training progress over time.

Built by Honar Abdi

---

![Dashboard](screenshots/dashboard.png)

---

## What is this?

I have been going to the gym regularly for over a year and wanted a proper way to track my progress. Instead of spreadsheets or generic fitness apps, I built exactly what I needed. A personal analytics tool that turns raw workout data into meaningful insights.

---

## Screenshots

| Dashboard | Workout Logging |
|-----------|----------------|
| ![Dashboard](screenshots/dashboard.png) | ![Logging](screenshots/bulk.png) |

| History | Progress |
|---------|----------|
| ![History](screenshots/history.png) | ![Progress](screenshots/progress.png) |

---

## Features

Dashboard
- Weekly training goal with progress bar
- 28-day calendar with color-coded session types
- Last session summary including sets, exercises and best set
- Training split breakdown for the current month
- Weekly set volume chart for the last 6 weeks
- Personal records per exercise with sparkline trend charts

Workout Logging
- Natural language input, type workouts line by line
- Format: Exercise weight x reps
- Quick-select buttons for session name and date
- Preview and confirm before saving to database

History
- Full session history sorted by date
- Expandable session details with all sets
- Delete individual sets or entire sessions

Progress
- Per-exercise progress history
- Estimated 1 rep max trend using the Epley formula
- Monthly comparison chart
- Volume and frequency statistics
- Plateau detection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLite, Pydantic |
| Frontend | React, Vite |
| Charts | Canvas API, no chart library |
| Styling | CSS Variables, custom animations |

---

## Project Structure
```
gym-agent/
├── app/
│   ├── repositories/
│   │   └── repo.py
│   ├── routers/
│   │   ├── analytics.py
│   │   ├── bulk.py
│   │   ├── chat.py
│   │   ├── confirm.py
│   │   ├── dashboard.py
│   │   └── workouts.py
│   ├── schemas/
│   │   └── models.py
│   ├── services/
│   │   ├── dashboard.py
│   │   ├── parsing.py
│   │   └── progress.py
│   ├── db.py
│   └── main.py
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/dashboard/
│       │   ├── LastSession.jsx
│       │   ├── MonthCalendar.jsx
│       │   ├── PRCard.jsx
│       │   ├── PRGrid.jsx
│       │   ├── StreakBar.jsx
│       │   ├── TrainingSplit.jsx
│       │   ├── WeeklyVolume.jsx
│       │   └── WeekStrip.jsx
│       ├── pages/
│       │   ├── Bulk.jsx
│       │   ├── Dashboard.jsx
│       │   ├── History.jsx
│       │   ├── Log.jsx
│       │   └── Progress.jsx
│       ├── api.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── gym.sqlite
└── query.sql
```

---

## Running Locally

Requirements: Python 3.10 or higher and Node.js 18 or higher.

Backend
```
cd gym-agent
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend
```
cd gym-agent/frontend
npm install
npm run dev
```

App runs at http://localhost:5173

---

## Data Model
```
workout_session (id, date, name)
set_entry       (id, session_id, exercise, weight, reps, extra_reps)
```

All analytics are computed at query time from raw set data.

---

## Key Technical Decisions

SQLite over PostgreSQL. This is a single user personal project with no infrastructure overhead and the database is just a file.

Custom Canvas charts. All visualizations are built from scratch using the Canvas API instead of a chart library which gives full control over appearance and behavior.

Natural language input. Logging workouts by typing is faster than filling out forms and the parser handles fuzzy matching for exercise names.

Epley formula for e1RM. The formula is weight multiplied by 1 plus reps divided by 30 which gives an estimated 1 rep max used for progress tracking and personal records.

---

## What I Learned

Building this project end to end taught me how to design and connect all layers of a full-stack application from database schema to REST API to frontend state management. The most interesting technical challenge was building the analytics layer by aggregating time-series workout data into meaningful metrics like monthly comparisons, plateau detection and personal records.

Working with the Canvas API for custom charts was also new territory. Handling device pixel ratios, resize observers and smooth animations without any library required careful implementation.

---

Built for personal use. Real data, real workouts.