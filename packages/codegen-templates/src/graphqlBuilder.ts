export interface Field {
  name: string;
  type: string;
}

export interface Model {
  name: string;
  fields: Field[];
}

export function generateSchema(models: Model[]): string {
  const types = models
    .map((m) => {
      const fields = m.fields.map((f) => `  ${f.name}: ${f.type}`).join('\n');
      return `type ${m.name} {\n${fields}\n}`;
    })
    .join('\n\n');
  return `schema { query: Query }\n\n${types}`;
}
