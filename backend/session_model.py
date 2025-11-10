from typing import List, Dict, Any
from datetime import datetime
from db import get_db, init_db

# ensure table exists
init_db()

def save_session_record(
    model_used: str,
    source: str,
    total: int,
    breakdown: Dict[str, int],
    avg_fps: float
) -> None:
    conn = get_db()
    cur = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    name = f"Session – {timestamp}"
    cur.execute("""
        INSERT INTO sessions
        (name, timestamp, model_used, source, total_vehicles, car, van, truck, bus, avg_fps)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        name, timestamp, model_used, source, total,
        breakdown.get("car", 0),
        breakdown.get("van", 0),
        breakdown.get("truck", 0),
        breakdown.get("bus", 0),
        float(avg_fps or 0.0),
    ))
    conn.commit()
    conn.close()

def fetch_all_sessions() -> List[Dict[str, Any]]:
    conn = get_db()
    cur = conn.cursor()
    rows = cur.execute("SELECT * FROM sessions ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_session(session_id: int) -> bool:
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE id=?", (session_id,))
    conn.commit()
    ok = cur.rowcount > 0
    conn.close()
    return ok
