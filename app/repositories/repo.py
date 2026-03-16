from typing import Optional, List
from app.db import get_connection


def fetch_exercises() -> List[str]:
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT DISTINCT exercise
        FROM set_entry
        ORDER BY exercise ASC
    """).fetchall()
    conn.close()
    return [r["exercise"] for r in rows]


def get_or_create_session_id(session_date: str, name: str = None) -> int:
    conn = get_connection()
    cur = conn.cursor()

    row = cur.execute(
        "SELECT id FROM workout_session WHERE date = ? ORDER BY id DESC LIMIT 1",
        (session_date,)
    ).fetchone()

    if row:
        session_id = int(row["id"])
        if name:
            cur.execute("UPDATE workout_session SET name = ? WHERE id = ?", (name, session_id))
            conn.commit()
        conn.close()
        return session_id

    cur.execute("INSERT INTO workout_session (date, name) VALUES (?, ?)", (session_date, name))
    session_id = int(cur.lastrowid)
    conn.commit()
    conn.close()
    return session_id


def next_set_index(session_id: int, exercise: str) -> int:
    conn = get_connection()
    cur = conn.cursor()

    row = cur.execute(
        "SELECT MAX(set_index) AS m FROM set_entry WHERE session_id = ? AND exercise = ?",
        (session_id, exercise)
    ).fetchone()

    conn.close()
    if row and row["m"] is not None:
        return int(row["m"]) + 1
    return 0


def insert_set(
    session_id: int,
    exercise: str,
    set_index: int,
    weight: float,
    reps: int,
    extra_reps: Optional[int],
    rir: Optional[int],
    side: Optional[str],
) -> None:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO set_entry (session_id, exercise, set_index, weight, reps, extra_reps, rir, side)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id, exercise, set_index)
        DO UPDATE SET
            weight=excluded.weight,
            reps=excluded.reps,
            extra_reps=excluded.extra_reps,
            rir=excluded.rir,
            side=excluded.side
    """, (session_id, exercise, set_index, weight, reps, extra_reps, rir, side))

    conn.commit()
    conn.close()


def insert_session_with_items(items) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("INSERT INTO workout_session DEFAULT VALUES")
    session_id = int(cur.lastrowid)

    for block in items:
        for idx, s in enumerate(block.sets):
            cur.execute("""
                INSERT INTO set_entry (session_id, exercise, set_index, weight, reps, extra_reps, rir, side)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id,
                block.exercise,
                idx,
                s.weight,
                s.reps,
                s.extra_reps,
                s.rir,
                s.side
            ))

    conn.commit()
    conn.close()
    return session_id


def fetch_sets_for_exercise(exercise_name: str):
    conn = get_connection()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT
            ws.date AS date,
            se.weight AS weight,
            se.reps AS reps,
            se.extra_reps AS extra_reps,
            se.rir AS rir,
            se.side AS side,
            se.set_index AS set_index
        FROM set_entry se
        JOIN workout_session ws ON ws.id = se.session_id
        WHERE se.exercise = ?
        ORDER BY ws.date ASC, se.set_index ASC
    """, (exercise_name,)).fetchall()

    conn.close()
    return rows


def fetch_all_sessions():
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT ws.id, ws.date, ws.name, COUNT(se.id) as set_count
        FROM workout_session ws
        LEFT JOIN set_entry se ON se.session_id = ws.id
        GROUP BY ws.id
        ORDER BY ws.date DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def fetch_sets_for_session(session_id: int):
    conn = get_connection()
    cur = conn.cursor()
    rows = cur.execute("""
        SELECT id, exercise, set_index, weight, reps, extra_reps, rir, side
        FROM set_entry
        WHERE session_id = ?
        ORDER BY exercise ASC, set_index ASC
    """, (session_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_set(set_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM set_entry WHERE id = ?", (set_id,))
    deleted = cur.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def delete_session(session_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM set_entry WHERE session_id = ?", (session_id,))
    cur.execute("DELETE FROM workout_session WHERE id = ?", (session_id,))
    deleted = cur.rowcount > 0
    conn.commit()
    conn.close()
    return deleted