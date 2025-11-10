import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "database" / "sessions.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            model_used TEXT NOT NULL,
            source TEXT NOT NULL,
            total_vehicles INTEGER NOT NULL,
            car INTEGER DEFAULT 0,
            van INTEGER DEFAULT 0,
            truck INTEGER DEFAULT 0,
            bus INTEGER DEFAULT 0,
            avg_fps REAL DEFAULT 0
        );
    """)
    conn.commit()
    conn.close()
