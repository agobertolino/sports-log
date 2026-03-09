import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('sportslog.db');

export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data_nascita TEXT,
      peso REAL,
      altezza REAL,
      creato_il TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sport TEXT NOT NULL,
      muscoli TEXT,
      note TEXT,
      durata_secondi INTEGER,
      data TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      esercizio TEXT NOT NULL,
      muscolo TEXT,
      serie INTEGER,
      reps INTEGER,
      peso_kg REAL,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );
  `);
}

export default db;
