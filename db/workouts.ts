import db from './database';

export type Workout = {
  id: number;
  sport: string;
  muscoli: string | null;
  note: string | null;
  durata_secondi: number | null;
  draft: string | null;
  data: string;
};

export type WorkoutSet = {
  id: number;
  workout_id: number;
  esercizio: string;
  muscolo: string | null;
  serie: number | null;
  reps: number | null;
  peso_kg: number | null;
};

export type CreateWorkoutInput = {
  sport: string;
  muscoli?: string[];
  note?: string;
};

export type CreateSetInput = {
  workout_id: number;
  esercizio: string;
  muscolo?: string;
  serie?: number;
  reps?: number;
  peso_kg?: number;
};

export function createWorkout(input: CreateWorkoutInput): number {
  const result = db.runSync(
    `INSERT INTO workouts (sport, muscoli, note) VALUES (?, ?, ?)`,
    [input.sport, input.muscoli?.join(',') ?? null, input.note ?? null]
  );
  return result.lastInsertRowId;
}

export function addSet(input: CreateSetInput): void {
  db.runSync(
    `INSERT INTO workout_sets (workout_id, esercizio, muscolo, serie, reps, peso_kg)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.workout_id, input.esercizio, input.muscolo ?? null,
     input.serie ?? null, input.reps ?? null, input.peso_kg ?? null]
  );
}

export function getAllWorkouts(): Workout[] {
  return db.getAllSync<Workout>(
    `SELECT * FROM workouts ORDER BY data DESC`
  );
}

export function getWorkoutById(id: number): Workout | null {
  return db.getFirstSync<Workout>(`SELECT * FROM workouts WHERE id = ?`, [id]);
}

export function getSetsForWorkout(workout_id: number): WorkoutSet[] {
  return db.getAllSync<WorkoutSet>(
    `SELECT * FROM workout_sets WHERE workout_id = ? ORDER BY id ASC`,
    [workout_id]
  );
}

export function deleteWorkout(id: number): void {
  db.runSync(`DELETE FROM workouts WHERE id = ?`, [id]);
  // Pulisci i fantasmi
  try { db.runSync(`DELETE FROM workouts WHERE durata_secondi IS NULL`); } catch(e) {}
}

export function finishWorkout(id: number, durata_secondi: number): void {
  db.runSync(
    `UPDATE workouts SET durata_secondi = ? WHERE id = ?`,
    [durata_secondi, id]
  );
  // Elimina qualsiasi altra bozza orfana per evitare che rispunti nella home
  try { db.runSync(`DELETE FROM workouts WHERE durata_secondi IS NULL`); } catch(e) {}
}

export function getActiveWorkout(): Workout | null {
  // Pulizia: elimina le bozze abbandonate vuote per evitare ripristini fantasma
  db.runSync(`DELETE FROM workouts WHERE durata_secondi IS NULL AND id NOT IN (SELECT workout_id FROM workout_sets)`);
  // Prendi l'ultimo aperto
  return db.getFirstSync<Workout>(`SELECT * FROM workouts WHERE durata_secondi IS NULL ORDER BY id DESC LIMIT 1`);
}
