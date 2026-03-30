from app.db import get_connection


def insert_cardio(session_id: int, cardio_type: str, duration_min: float, distance_km: float) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO cardio_entry (session_id, type, duration_min, distance_km)
        VALUES (?, ?, ?, ?)
    """, (session_id, cardio_type, duration_min, distance_km))

    cardio_id = int(cur.lastrowid)
    conn.commit()
    conn.close()
    return cardio_id


def fetch_all_cardio():
    conn = get_connection()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT
            ce.id,
            ce.session_id,
            ws.date,
            ce.type,
            ce.duration_min,
            ce.distance_km
        FROM cardio_entry ce
        JOIN workout_session ws ON ws.id = ce.session_id
        ORDER BY ws.date DESC
    """).fetchall()

    conn.close()
    return [dict(r) for r in rows]


def fetch_cardio_for_session(session_id: int):
    conn = get_connection()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT id, type, duration_min, distance_km
        FROM cardio_entry
        WHERE session_id = ?
    """, (session_id,)).fetchall()

    conn.close()
    return [dict(r) for r in rows]


def delete_cardio(cardio_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM cardio_entry WHERE id = ?", (cardio_id,))
    deleted = cur.rowcount > 0
    conn.commit()
    conn.close()
    return deleted