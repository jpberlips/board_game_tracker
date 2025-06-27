#!/usr/bin/env python3
"""
Migration 001: Add file upload support
- Adds rulebook_pdf column to Game table
- Adds photo_url column to GameSession table
- Creates upload directories
"""

import sqlite3
import os
from datetime import datetime

MIGRATION_VERSION = 1
MIGRATION_NAME = "add_file_support"

def up(db_path):
    """Apply the migration"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(game)")
        game_columns = [column[1] for column in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(game_session)")
        session_columns = [column[1] for column in cursor.fetchall()]
        
        changes_made = []
        
        # Add rulebook_pdf column to game table if it doesn't exist
        if 'rulebook_pdf' not in game_columns:
            cursor.execute("ALTER TABLE game ADD COLUMN rulebook_pdf VARCHAR(500)")
            changes_made.append("Added rulebook_pdf column to game table")
        
        # Add photo_url column to game_session table if it doesn't exist
        if 'photo_url' not in session_columns:
            cursor.execute("ALTER TABLE game_session ADD COLUMN photo_url VARCHAR(500)")
            changes_made.append("Added photo_url column to game_session table")
        
        # Create upload directories
        upload_base = os.path.join(os.path.dirname(db_path), '..', 'uploads')
        os.makedirs(os.path.join(upload_base, 'photos'), exist_ok=True)
        os.makedirs(os.path.join(upload_base, 'rulebooks'), exist_ok=True)
        changes_made.append("Created upload directories")
        
        conn.commit()
        conn.close()
        
        return True, changes_made
        
    except Exception as e:
        conn.close()
        raise e

def down(db_path):
    """Rollback the migration (SQLite doesn't support DROP COLUMN easily)"""
    # SQLite doesn't support DROP COLUMN, so we'd need to recreate tables
    # For this migration, we'll just document what would be removed
    return True, [
        "Note: SQLite doesn't support DROP COLUMN easily",
        "To rollback: restore from backup or recreate tables without the new columns"
    ]

def check_can_apply(db_path):
    """Check if this migration can be applied"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if required tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('game', 'game_session')")
        tables = [row[0] for row in cursor.fetchall()]
        
        conn.close()
        
        if 'game' not in tables or 'game_session' not in tables:
            return False, "Required tables (game, game_session) do not exist"
        
        return True, "Ready to apply"
        
    except Exception as e:
        return False, f"Error checking database: {e}"