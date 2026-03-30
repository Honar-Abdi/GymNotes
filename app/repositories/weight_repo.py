from app.db import get_connection


def upsert_weight(date: str, weight_kg: float) -> int:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO weight_entry (date, weight_kg)
        VALUES (?, ?)
        ON CONFLICT(date)
        DO UPDATE SET weight_kg = excluded.weight_kg
    """, (date, weight_kg))

    row_id = int(cur.lastrowid)
    conn.commit()
    conn.close()
    return row_id


def fetch_all_weights():
    conn = get_connection()
    cur = conn.cursor()

    rows = cur.execute("""
        SELECT id, date, weight_kg
        FROM weight_entry
        ORDER BY date ASC
    """).fetchall()

    conn.close()
    return [dict(r) for r in rows]


def fetch_latest_weight():
    conn = get_connection()
    cur = conn.cursor()

    row = cur.execute("""
        SELECT id, date, weight_kg
        FROM weight_entry
        ORDER BY date DESC
        LIMIT 1
    """).fetchone()

    conn.close()
    return dict(row) if row else None


def delete_weight(weight_id: int) -> bool:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM weight_entry WHERE id = ?", (weight_id,))
    deleted = cur.rowcount > 0
    conn.commit()
    conn.close()
    return deleted