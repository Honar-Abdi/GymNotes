import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "gym.sqlite"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _column_exists(cursor: sqlite3.Cursor, table: str, column: str) -> bool:
    rows = cursor.execute(f"PRAGMA table_info({table})").fetchall()
    return any(r[1] == column for r in rows)


def _table_exists(cursor: sqlite3.Cursor, table: str) -> bool:
    row = cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,)
    ).fetchone()
    return row is not None


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workout_session (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT DEFAULT CURRENT_DATE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS set_entry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        exercise TEXT NOT NULL,
        set_index INTEGER NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES workout_session(id)
    )
    """)

    # --- Migraatiot: set_entry ---
    if not _column_exists(cursor, "set_entry", "rir"):
        cursor.execute("ALTER TABLE set_entry ADD COLUMN rir INTEGER NULL")

    if not _column_exists(cursor, "set_entry", "side"):
        cursor.execute("ALTER TABLE set_entry ADD COLUMN side TEXT NULL")

    if not _column_exists(cursor, "set_entry", "extra_reps"):
        cursor.execute("ALTER TABLE set_entry ADD COLUMN extra_reps INTEGER NULL")

    if not _column_exists(cursor, "workout_session", "name"):
        cursor.execute("ALTER TABLE workout_session ADD COLUMN name TEXT NULL")

    cursor.execute("""
    CREATE UNIQUE INDEX IF NOT EXISTS ux_set_entry_session_exercise_setindex
    ON set_entry(session_id, exercise, set_index)
    """)

    # --- Migraatio: cardio_entry ---
    if not _table_exists(cursor, "cardio_entry"):
        cursor.execute("""
        CREATE TABLE cardio_entry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            duration_min REAL NOT NULL,
            distance_km REAL NOT NULL,
            FOREIGN KEY (session_id) REFERENCES workout_session(id)
        )
        """)

    conn.commit()
    conn.close()