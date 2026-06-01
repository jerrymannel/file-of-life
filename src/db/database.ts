import SqlJs, { type Database } from 'sql.js'
// sql.js ships CJS; grab the callable init function from the namespace
const initSqlJs = (SqlJs as unknown as { default?: typeof SqlJs }).default ?? SqlJs
import type { FormData, RecordRow, EditHistoryRow } from '../types'

const STORAGE_KEY = 'fileoflife_db'

let db: Database | null = null

function persistDB(): void {
  if (!db) return
  const exported = db.export()
  const chars = Array.from(exported, (b) => String.fromCharCode(b))
  const b64 = btoa(chars.join(''))
  localStorage.setItem(STORAGE_KEY, b64)
}

export async function initDB(): Promise<void> {
  const SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const binary = atob(stored)
      const buf = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        buf[i] = binary.charCodeAt(i)
      }
      db = new SQL.Database(buf)
    } catch {
      db = new SQL.Database()
    }
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS edit_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      edited_at TEXT NOT NULL,
      snapshot TEXT NOT NULL
    )
  `)

  persistDB()
}

function getDB(): Database {
  if (!db) throw new Error('Database not initialized. Call initDB() first.')
  return db
}

export async function saveRecord(data: FormData): Promise<number> {
  const database = getDB()
  const now = new Date().toISOString()
  const json = JSON.stringify(data)

  database.run(
    'INSERT INTO records (created_at, updated_at, data) VALUES (?, ?, ?)',
    [now, now, json]
  )

  const result = database.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0] as number

  database.run(
    'INSERT INTO edit_history (record_id, edited_at, snapshot) VALUES (?, ?, ?)',
    [id, now, json]
  )

  persistDB()
  return id
}

export async function updateRecord(id: number, data: FormData): Promise<void> {
  const database = getDB()
  const now = new Date().toISOString()
  const json = JSON.stringify(data)

  database.run(
    'UPDATE records SET updated_at = ?, data = ? WHERE id = ?',
    [now, json, id]
  )

  database.run(
    'INSERT INTO edit_history (record_id, edited_at, snapshot) VALUES (?, ?, ?)',
    [id, now, json]
  )

  persistDB()
}

export async function getAllRecords(): Promise<RecordRow[]> {
  const database = getDB()
  const result = database.exec(`
    SELECT r.id, r.created_at, r.updated_at, r.data,
           COUNT(eh.id) as edit_count
    FROM records r
    LEFT JOIN edit_history eh ON eh.record_id = r.id
    GROUP BY r.id
    ORDER BY r.updated_at DESC
  `)

  if (!result.length) return []

  return result[0].values.map((row) => ({
    id: row[0] as number,
    created_at: row[1] as string,
    updated_at: row[2] as string,
    data: JSON.parse(row[3] as string) as FormData,
    editCount: row[4] as number,
  }))
}

export async function getRecord(id: number): Promise<RecordRow | null> {
  const database = getDB()
  const result = database.exec(
    'SELECT id, created_at, updated_at, data FROM records WHERE id = ?',
    [id]
  )

  if (!result.length || !result[0].values.length) return null

  const row = result[0].values[0]
  return {
    id: row[0] as number,
    created_at: row[1] as string,
    updated_at: row[2] as string,
    data: JSON.parse(row[3] as string) as FormData,
  }
}

export async function deleteRecord(id: number): Promise<void> {
  const database = getDB()
  database.run('DELETE FROM edit_history WHERE record_id = ?', [id])
  database.run('DELETE FROM records WHERE id = ?', [id])
  persistDB()
}

export async function getEditHistory(recordId: number): Promise<EditHistoryRow[]> {
  const database = getDB()
  const result = database.exec(
    'SELECT id, record_id, edited_at, snapshot FROM edit_history WHERE record_id = ? ORDER BY edited_at DESC',
    [recordId]
  )

  if (!result.length) return []

  return result[0].values.map((row) => ({
    id: row[0] as number,
    record_id: row[1] as number,
    edited_at: row[2] as string,
    snapshot: JSON.parse(row[3] as string) as FormData,
  }))
}
