import fs from 'fs';
import path from 'path';

export interface Column {
  name: string;
  type: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export interface Schema {
  tables: Table[];
}

const HISTORY_FILE = process.env.SCHEMA_HISTORY_FILE || 'schema.history.json';
const MIGRATIONS_FILE = process.env.MIGRATIONS_FILE || 'migrations.sql';

export function loadHistory(): Schema[] {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')) as Schema[];
}

export function saveSchema(schema: Schema) {
  const history = loadHistory();
  history.push(schema);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

function findTable(tables: Table[], name: string): Table | undefined {
  return tables.find((t) => t.name === name);
}

export function diffSchemas(oldSchema: Schema, newSchema: Schema): string[] {
  const commands: string[] = [];
  for (const table of newSchema.tables) {
    const prev = findTable(oldSchema.tables, table.name);
    if (!prev) {
      const cols = table.columns
        .map((c) => `  ${c.name} ${c.type}`)
        .join(',\n');
      commands.push(`CREATE TABLE IF NOT EXISTS ${table.name} (\n${cols}\n);`);
      continue;
    }
    for (const col of table.columns) {
      if (!prev.columns.find((c) => c.name === col.name)) {
        commands.push(
          `ALTER TABLE ${table.name} ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
        );
      }
    }
  }
  return commands;
}

export function generateMigrations(newSchema: Schema): string[] {
  const history = loadHistory();
  const last = history[history.length - 1];
  if (last) {
    const commands = diffSchemas(last, newSchema);
    if (commands.length) {
      fs.appendFileSync(MIGRATIONS_FILE, commands.join('\n') + '\n');
    }
    saveSchema(newSchema);
    return commands;
  }
  // first schema just stored
  saveSchema(newSchema);
  return [];
}
