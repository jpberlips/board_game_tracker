#!/usr/bin/env python3
"""
Database migration script to add new fields to the Game model.
Run this script to update your existing database with the new pricing and rating fields.
"""

import sqlite3
import os

DB_PATH = 'instance/games.db'

def migrate_database():
    print("Migrating database to add new fields...")
    
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} does not exist. No migration needed.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get current table schema
    cursor.execute("PRAGMA table_info(game)")
    columns = [column[1] for column in cursor.fetchall()]
    print(f"Current columns: {columns}")
    
    # Add new columns if they don't exist
    new_columns = [
        ('price_new', 'FLOAT'),
        ('price_used', 'FLOAT'),
        ('msrp', 'FLOAT'),
        ('personal_rating', 'FLOAT'),
        ('acquisition_price', 'FLOAT'),
        ('purchase_date', 'DATETIME')
    ]
    
    for column_name, column_type in new_columns:
        if column_name not in columns:
            try:
                cursor.execute(f"ALTER TABLE game ADD COLUMN {column_name} {column_type}")
                print(f"Added column: {column_name}")
            except sqlite3.OperationalError as e:
                print(f"Error adding column {column_name}: {e}")
    
    conn.commit()
    conn.close()
    print("Database migration completed!")

if __name__ == '__main__':
    migrate_database()