"""
Migration 002: Add rulebook_url field to Game table
"""

import sqlite3

MIGRATION_VERSION = 2
MIGRATION_NAME = "add_rulebook_url"

def up(db_path):
    """Add rulebook_url column to games table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(game)")
        game_columns = [column[1] for column in cursor.fetchall()]
        
        changes_made = []
        
        # Add rulebook_url column to game table if it doesn't exist
        if 'rulebook_url' not in game_columns:
            cursor.execute("ALTER TABLE game ADD COLUMN rulebook_url VARCHAR(500)")
            changes_made.append("Added rulebook_url column to game table")
            conn.commit()
        else:
            changes_made.append("rulebook_url column already exists in game table")
        
        return True, changes_made
    
    finally:
        conn.close()

def down(db_path):
    """Remove rulebook_url column from games table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
        cursor.execute("""
            CREATE TABLE game_new (
                id INTEGER PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                bgg_id INTEGER,
                owner VARCHAR(100) NOT NULL,
                location VARCHAR(200),
                min_players INTEGER,
                max_players INTEGER,
                playing_time INTEGER,
                complexity FLOAT,
                image_url VARCHAR(500),
                description TEXT,
                rank_overall INTEGER,
                rank_strategy INTEGER,
                rank_family INTEGER,
                price_new FLOAT,
                price_used FLOAT,
                msrp FLOAT,
                personal_rating FLOAT,
                acquisition_price FLOAT,
                purchase_date DATETIME,
                rulebook_pdf VARCHAR(500),
                created_at DATETIME
            )
        """)
        
        cursor.execute("""
            INSERT INTO game_new SELECT 
                id, name, bgg_id, owner, location, min_players, max_players, 
                playing_time, complexity, image_url, description, rank_overall, 
                rank_strategy, rank_family, price_new, price_used, msrp, 
                personal_rating, acquisition_price, purchase_date, 
                rulebook_pdf, created_at
            FROM game
        """)
        
        cursor.execute("DROP TABLE game")
        cursor.execute("ALTER TABLE game_new RENAME TO game")
        conn.commit()
        
        return True, ["Removed rulebook_url column from game table"]
    
    finally:
        conn.close()