import { exportDB, importDB } from 'dexie-export-import';
import { db } from './db';

export async function backupDB(filename?: string) {
  const blob = await exportDB(db);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const version = db.verno;
  a.download = filename ?? `db-backup-v${version}-${ts}.db`;

  a.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Backup exported: ${a.download}`);
}

export async function restoreDB(file: File) {
  // Step 1: auto-backup current DB
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const version = db.verno;
  const autoName = `auto-db-backup-v${version}-${ts}.db`;
  await backupDB(autoName);

  // Step 2: close DB and delete it
  db.close();
  await indexedDB.deleteDatabase(db.name);

  // Step 3: restore from file
  await importDB(file);

  console.log('✅ Database restored from', file.name);
}

