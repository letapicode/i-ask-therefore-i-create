import express from 'express';
import { createNeo4jConnector } from '@iac/data-connectors/graph';

const NEO4J_URL = process.env.NEO4J_URL || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || 'password';

const db = createNeo4jConnector({ url: NEO4J_URL, user: NEO4J_USER, password: NEO4J_PASS });

export const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
  const { id, name } = req.body;
  const [u] = await db.query('CREATE (u:User {id: $id, name: $name}) RETURN u', { id, name });
  res.json(u);
});

app.get('/users/:id', async (req, res) => {
  const [u] = await db.query('MATCH (u:User {id: $id}) RETURN u', { id: req.params.id });
  res.json(u || null);
});

const port = Number(process.env.PORT || '4000');
app.listen(port, () => console.log(`graph api listening on ${port}`));
