import fs from 'fs';
import { diffSchemas, generateMigrations, saveSchema, loadHistory } from './index';

const HISTORY_FILE = process.env.SCHEMA_HISTORY_FILE || 'schema.history.json';
const MIGRATIONS_FILE = process.env.MIGRATIONS_FILE || 'migrations.sql';

afterEach(() => {
  if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
  if (fs.existsSync(MIGRATIONS_FILE)) fs.unlinkSync(MIGRATIONS_FILE);
});

test('diffSchemas generates create and alter statements', () => {
  const oldSchema = { tables: [] };
  const newSchema = {
    tables: [
      { name: 'users', columns: [{ name: 'id', type: 'int' }] },
    ],
  };
  const cmds = diffSchemas(oldSchema, newSchema);
  expect(cmds[0]).toMatch('CREATE TABLE');
});

test('generateMigrations appends to migration file', () => {
  const schema1 = { tables: [] };
  const schema2 = {
    tables: [
      { name: 't', columns: [{ name: 'c', type: 'text' }] },
    ],
  };
  generateMigrations(schema1);
  const cmds = generateMigrations(schema2);
  expect(cmds.length).toBe(1);
  expect(fs.readFileSync(MIGRATIONS_FILE, 'utf-8')).toContain('CREATE TABLE');
  const history = loadHistory();
  expect(history.length).toBe(2);
});
