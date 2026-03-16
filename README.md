# GymNotes

Personal gym tracking and analytics application for logging workouts and visualizing training progress over time.

Built by Honar Abdi.

---

## Overview

GymNotes is a full-stack web application I built after going to the gym regularly for over a year and wanting a proper way to track and analyze my progress. Instead of using a generic fitness app, I built exactly what I needed.

The app lets me log every workout session using a natural text format, stores the data in a local SQLite database, and visualizes progress through an analytics dashboard.

---

## Features

### Dashboard
- Weekly goal tracker with progress bar (target: 4 sessions per week)
- 28-day training calendar with color-coded session types
- Last session summary with sets, exercises and best set
- Training split breakdown for the current month
- Weekly sets per week for the last 6 weeks
- Personal records per exercise with sparkline trend charts

### Workout Logging
- Natural language bulk input, type workouts line by line
- Format: Exercise weight x reps
- Session naming with quick-select buttons
- Date quick-select for today, yesterday or previous days
- Preview and confirm before saving

### History
- Full session history sorted by date
- Session details with all sets
- Delete individual sets or entire sessions

### Progress
- Select any exercise to view full progress history
- Estimated 1 rep max trend over time using the Epley formula
- Best set per session and volume trends

---

## Tech Stack

### Backend
- Python
- FastAPI
- SQLite
- Pydantic

### Frontend
- React
- Vite
- Canvas API for custom charts
- CSS Variables for theming

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
│       ├── components/
│       │   └── dashboard/
│       │       ├── LastSession.jsx
│       │       ├── MonthCalendar.jsx
│       │       ├── PRCard.jsx
│       │       ├── PRGrid.jsx
│       │       ├── StreakBar.jsx
│       │       ├── TrainingSplit.jsx
│       │       └── WeeklyVolume.jsx
│       ├── pages/
│       │   ├── Bulk.jsx
│       │   ├── Dashboard.jsx
│       │   ├── History.jsx
│       │   └── Progress.jsx
│       ├── api.js
│       └── App.jsx
├── gym.sqlite
└── query.sql

```
---

## Running Locally

### Requirements
- Python 3.10 or higher
- Node.js 18 or higher

### Backend
```
cd gym-agent
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
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

- SQLite over PostgreSQL because this is a single user personal project with no infrastructure overhead
- Custom Canvas charts instead of a chart library for full control over visuals
- Natural language input for faster workout logging
- Epley formula for estimated 1 rep max: weight x (1 + reps/30)

---

## What I Learned

- Building a full-stack application from scratch including API design, data modeling and frontend state management
- Writing analytical queries and aggregating time-series data
- Implementing custom data visualizations using the Canvas API
- Structuring a Python backend with separation of concerns between routers, services and repositories