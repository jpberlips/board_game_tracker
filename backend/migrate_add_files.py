#!/usr/bin/env python3
"""
Database migration script to add file upload support
Adds rulebook_pdf column to Game table and photo_url column to GameSession table
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    # Get the database path
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, "instance", "games.db")
    
    if not os.path.exists(db_path):
        print("Database file not found. Please run the application first to create the database.")
        return False
    
    # Create backup
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    try:
        # Copy database file for backup
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"Database backed up to: {backup_path}")
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(game)")
        game_columns = [column[1] for column in cursor.fetchall()]
        
        cursor.execute("PRAGMA table_info(game_session)")
        session_columns = [column[1] for column in cursor.fetchall()]
        
        # Add rulebook_pdf column to game table if it doesn't exist
        if 'rulebook_pdf' not in game_columns:
            cursor.execute("ALTER TABLE game ADD COLUMN rulebook_pdf VARCHAR(500)")
            print("Added rulebook_pdf column to game table")
        else:
            print("rulebook_pdf column already exists in game table")
        
        # Add photo_url column to game_session table if it doesn't exist
        if 'photo_url' not in session_columns:
            cursor.execute("ALTER TABLE game_session ADD COLUMN photo_url VARCHAR(500)")
            print("Added photo_url column to game_session table")
        else:
            print("photo_url column already exists in game_session table")
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        # Restore backup if migration failed
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, db_path)
            print("Database restored from backup")
        return False

if __name__ == "__main__":
    migrate_database()