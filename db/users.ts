import db from './database';

export type User = {
  id: number;
  nome: string;
  data_nascita: string | null;
  peso: number | null;
  altezza: number | null;
  creato_il: string;
};

export type CreateUserInput = {
  nome: string;
  data_nascita?: string;
  peso?: number;
  altezza?: number;
};

export function createUser(input: CreateUserInput): void {
  db.runSync(
    `INSERT INTO users (nome, data_nascita, peso, altezza) VALUES (?, ?, ?, ?)`,
    [input.nome, input.data_nascita ?? null, input.peso ?? null, input.altezza ?? null]
  );
}

export function getUser(): User | null {
  return db.getFirstSync<User>(`SELECT * FROM users ORDER BY id ASC LIMIT 1`);
}

export function updateUser(input: Partial<CreateUserInput>): void {
  const fields = Object.keys(input)
    .map(k => `${k} = ?`)
    .join(', ');
  const values = Object.values(input);
  db.runSync(`UPDATE users SET ${fields} WHERE id = (SELECT id FROM users LIMIT 1)`, values);
}

export function hasUser(): boolean {
  const result = db.getFirstSync<{ count: number }>(`SELECT COUNT(*) as count FROM users`);
  return (result?.count ?? 0) > 0;
}
