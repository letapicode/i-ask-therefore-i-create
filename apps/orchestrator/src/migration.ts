export interface Field {
  name: string;
  type: string;
}

export interface Model {
  name: string;
  fields: Field[];
}

function mapType(type: string): string {
  switch (type) {
    case 'int':
      return 'INTEGER';
    case 'string':
      return 'TEXT';
    case 'id':
      return 'SERIAL PRIMARY KEY';
    default:
      return type.toUpperCase();
  }
}

export function diffSchemas(oldModels: Model[], newModels: Model[]): string[] {
  const stmts: string[] = [];
  for (const table of newModels) {
    const prev = oldModels.find((m) => m.name === table.name);
    if (!prev) {
      const cols = table.fields
        .map((f) => `${f.name} ${mapType(f.type)}`)
        .join(', ');
      stmts.push(`CREATE TABLE ${table.name} (${cols});`);
    } else {
      for (const field of table.fields) {
        const oldField = prev.fields.find((f) => f.name === field.name);
        if (!oldField) {
          stmts.push(
            `ALTER TABLE ${table.name} ADD COLUMN ${field.name} ${mapType(field.type)};`
          );
        } else if (oldField.type !== field.type) {
          stmts.push(
            `ALTER TABLE ${table.name} ALTER COLUMN ${field.name} TYPE ${mapType(field.type)};`
          );
        }
      }
    }
  }
  return stmts;
}
