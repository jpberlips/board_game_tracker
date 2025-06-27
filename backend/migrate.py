#!/usr/bin/env python3
"""
Database Migration System for Board Game Tracker

Usage:
    python migrate.py status                 # Show migration status
    python migrate.py migrate               # Run pending migrations
    python migrate.py migrate --dry-run     # Show what would be migrated
    python migrate.py rollback <version>    # Rollback to specific version
"""

import sqlite3
import os
import sys
import importlib.util
import shutil
from datetime import datetime
from pathlib import Path

class MigrationRunner:
    def __init__(self, db_path=None):
        self.basedir = os.path.abspath(os.path.dirname(__file__))
        self.db_path = db_path or os.path.join(self.basedir, "instance", "games.db")
        self.migrations_dir = os.path.join(self.basedir, "migrations")
        
        # Ensure migrations table exists
        self._ensure_migrations_table()
    
    def _ensure_migrations_table(self):
        """Create migrations tracking table if it doesn't exist"""
        if not os.path.exists(self.db_path):
            print(f"Database not found at {self.db_path}")
            print("Please run the application first to create the database.")
            return
            
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name VARCHAR(255),
                applied_at TIMESTAMP,
                checksum VARCHAR(64)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _get_applied_migrations(self):
        """Get list of applied migrations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version, name, applied_at FROM schema_migrations ORDER BY version")
        applied = cursor.fetchall()
        
        conn.close()
        return applied
    
    def _get_available_migrations(self):
        """Get list of available migration files"""
        if not os.path.exists(self.migrations_dir):
            return []
        
        migrations = []
        for filename in sorted(os.listdir(self.migrations_dir)):
            if filename.endswith('.py') and filename[0].isdigit():
                # Extract version number from filename (e.g., "001_add_file_support.py" -> 1)
                try:
                    version = int(filename.split('_')[0])
                    migrations.append((version, filename))
                except ValueError:
                    continue
        
        return migrations
    
    def _load_migration_module(self, filename):
        """Load a migration module"""
        filepath = os.path.join(self.migrations_dir, filename)
        spec = importlib.util.spec_from_file_location("migration", filepath)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    
    def _backup_database(self):
        """Create a backup of the database"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = f"{self.db_path}.backup_{timestamp}"
        shutil.copy2(self.db_path, backup_path)
        return backup_path
    
    def _record_migration(self, version, name):
        """Record a migration as applied"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO schema_migrations (version, name, applied_at)
            VALUES (?, ?, ?)
        """, (version, name, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def _remove_migration_record(self, version):
        """Remove a migration record"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM schema_migrations WHERE version = ?", (version,))
        
        conn.commit()
        conn.close()
    
    def status(self):
        """Show migration status"""
        print("Migration Status:")
        print("=" * 50)
        
        applied = {version: (name, applied_at) for version, name, applied_at in self._get_applied_migrations()}
        available = self._get_available_migrations()
        
        if not available:
            print("No migrations found.")
            return
        
        for version, filename in available:
            status = "APPLIED" if version in applied else "PENDING"
            name = filename[4:-3].replace('_', ' ').title()  # Remove "001_" and ".py", format nicely
            
            if version in applied:
                applied_at = applied[version][1]
                print(f"  {version:03d} {name:<30} {status} ({applied_at})")
            else:
                print(f"  {version:03d} {name:<30} {status}")
        
        pending_count = len([v for v, _ in available if v not in applied])
        print(f"\nPending migrations: {pending_count}")
    
    def migrate(self, dry_run=False):
        """Run pending migrations"""
        applied = {version for version, _, _ in self._get_applied_migrations()}
        available = self._get_available_migrations()
        
        pending = [(v, f) for v, f in available if v not in applied]
        
        if not pending:
            print("No pending migrations.")
            return True
        
        print(f"Found {len(pending)} pending migration(s):")
        for version, filename in pending:
            name = filename[4:-3].replace('_', ' ').title()
            print(f"  {version:03d} {name}")
        
        if dry_run:
            print("\nDry run mode - no changes will be made.")
            return True
        
        # Create backup before applying migrations
        backup_path = self._backup_database()
        print(f"\nDatabase backed up to: {backup_path}")
        
        try:
            for version, filename in pending:
                print(f"\nApplying migration {version:03d}...")
                
                # Load migration module
                module = self._load_migration_module(filename)
                
                # Check if migration can be applied
                if hasattr(module, 'check_can_apply'):
                    can_apply, message = module.check_can_apply(self.db_path)
                    if not can_apply:
                        print(f"Cannot apply migration: {message}")
                        return False
                
                # Apply migration
                success, changes = module.up(self.db_path)
                
                if success:
                    # Record migration as applied
                    name = filename[4:-3]  # Remove "001_" and ".py"
                    self._record_migration(version, name)
                    
                    print(f"Migration {version:03d} applied successfully!")
                    for change in changes:
                        print(f"  - {change}")
                else:
                    print(f"Migration {version:03d} failed!")
                    return False
            
            print(f"\nAll migrations applied successfully!")
            return True
            
        except Exception as e:
            print(f"\nMigration failed: {e}")
            print(f"Database backup available at: {backup_path}")
            return False
    
    def rollback(self, target_version):
        """Rollback to a specific version"""
        applied = self._get_applied_migrations()
        available = dict(self._get_available_migrations())
        
        # Find migrations to rollback (in reverse order)
        to_rollback = [(v, n) for v, n, _ in applied if v > target_version]
        to_rollback.sort(reverse=True)  # Rollback in reverse order
        
        if not to_rollback:
            print(f"Already at or below version {target_version}")
            return True
        
        print(f"Rolling back {len(to_rollback)} migration(s) to version {target_version}:")
        for version, name in to_rollback:
            print(f"  {version:03d} {name}")
        
        # Create backup before rolling back
        backup_path = self._backup_database()
        print(f"\nDatabase backed up to: {backup_path}")
        
        try:
            for version, name in to_rollback:
                if version in available:
                    filename = available[version]
                    print(f"\nRolling back migration {version:03d}...")
                    
                    # Load migration module
                    module = self._load_migration_module(filename)
                    
                    # Rollback migration
                    if hasattr(module, 'down'):
                        success, changes = module.down(self.db_path)
                        
                        if success:
                            # Remove migration record
                            self._remove_migration_record(version)
                            
                            print(f"Migration {version:03d} rolled back!")
                            for change in changes:
                                print(f"  - {change}")
                        else:
                            print(f"Rollback of migration {version:03d} failed!")
                            return False
                    else:
                        print(f"Migration {version:03d} does not support rollback")
                        return False
            
            print(f"\nRollback to version {target_version} completed!")
            return True
            
        except Exception as e:
            print(f"\nRollback failed: {e}")
            print(f"Database backup available at: {backup_path}")
            return False

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    runner = MigrationRunner()
    command = sys.argv[1]
    
    if command == "status":
        runner.status()
    
    elif command == "migrate":
        dry_run = "--dry-run" in sys.argv
        success = runner.migrate(dry_run=dry_run)
        sys.exit(0 if success else 1)
    
    elif command == "rollback":
        if len(sys.argv) < 3:
            print("Usage: python migrate.py rollback <version>")
            sys.exit(1)
        
        try:
            target_version = int(sys.argv[2])
            success = runner.rollback(target_version)
            sys.exit(0 if success else 1)
        except ValueError:
            print("Version must be a number")
            sys.exit(1)
    
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()