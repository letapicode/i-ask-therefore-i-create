import fetch from 'node-fetch';
import neo4j from 'neo4j-driver';

export interface Neo4jOptions {
  url: string;
  user: string;
  password: string;
}

export function createNeo4jConnector(opts: Neo4jOptions) {
  const driver = neo4j.driver(opts.url, neo4j.auth.basic(opts.user, opts.password));
  return {
    async query(cypher: string, params: any = {}) {
      const session = driver.session();
      const result = await session.run(cypher, params);
      await session.close();
      return result.records.map(r => r.toObject());
    },
    close: () => driver.close()
  };
}

export interface NeptuneOptions {
  endpoint: string;
}

export function createNeptuneConnector(opts: NeptuneOptions) {
  return {
    async query(gremlin: string) {
      const res = await fetch(`${opts.endpoint}/gremlin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gremlin }),
      });
      if (!res.ok) throw new Error('Neptune query failed');
      return res.json();
    },
  };
}
